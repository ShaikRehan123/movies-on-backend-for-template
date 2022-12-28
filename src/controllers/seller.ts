import jsonWebToken from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Cryptr from "cryptr";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const prisma = new PrismaClient();
const cryptr = new Cryptr(process.env.SECRET_KEY || "SECRET_KEY");

export const register = async (req: Request, res: Response) => {
  try {
    const seller = await prisma.seller.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: cryptr.encrypt(req.body.password),
        movies: {},
        series: {},
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const token = jsonWebToken.sign(
      {
        id: seller.id,
      },
      process.env.SECRET_KEY || "SECRET_KEY",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).send({
      message: "Seller registered successfully",
      seller,
      token,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(400).send({
          message: "Duplicate email",
        });
      } else {
        return res.status(500).send({
          message: "Something went wrong",
          err,
        });
      }
    } else {
      return res.status(500).send({
        message: "Something went wrong",
        err,
      });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: {
        email: req.body.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });
    if (seller) {
      const decryptedPassword = cryptr.decrypt(seller.password);
      if (decryptedPassword === req.body.password) {
        const token = jsonWebToken.sign(
          {
            id: seller.id,
          },
          process.env.SECRET_KEY || "SECRET_KEY",
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          message: "Seller logged in successfully",
          seller: {
            id: seller.id,
            name: seller.name,
            email: seller.email,
          },
          token,
        });
      } else {
        return res.status(400).send({
          message: "Invalid password",
        });
      }
    } else {
      return res.status(400).send({
        message: "seller not found",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const uploadMovie = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (!req.dataFromMiddleware) {
    req.dataFromMiddleware = {};
  }
  try {
    const seller = await prisma.seller.findUnique({
      where: {
        id: req.dataFromMiddleware.seller_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (seller) {
      try {
        const movies = await prisma.seller.update({
          where: {
            id: seller.id,
          },
          data: {
            movies: {
              create: {
                title: req.body.title,
                director: req.body.director,
                year: req.body.year,
                // genre: {
                //   connect: {
                //     id: req.body.genre_id,
                //   },
                // },
                uploadPath: "",
                thumbNailPath: "",
              },
            },
          },
          select: {
            movies: {
              select: {
                id: true,
              },
            },
          },
        });

        if (movies.movies.length > 0) {
          req.dataFromMiddleware = {
            ...req.dataFromMiddleware,
            movie_id: movies.movies[movies.movies.length - 1].id,
          };
        }
        next();
      } catch (err) {
        return res.status(500).send({
          message: "Something went wrong",
          err,
        });
      }
    } else {
      return res.status(400).send({
        message: "seller not found",
      });
    }
  } catch (err) {
    req.dataFromMiddleware = { ...req.dataFromMiddleware, error: err };
    next();
  }
};

export const verifyToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    try {
      const verified = jsonWebToken.verify(
        req.token,
        process.env.SECRET_KEY || "SECRET_KEY"
      );
      if (verified) {
        const seller = await prisma.seller.findUnique({
          where: {
            id: (verified as any).id,
          },
          select: {
            id: true,
            isVerified: true,
          },
        });
        if (seller?.isVerified) {
          req.dataFromMiddleware = {
            ...req.dataFromMiddleware,
            seller_id: seller.id,
          };
          next();
        } else {
          return res.status(401).send({
            message: "Seller not verified",
          });
        }
      } else {
        return res.status(401).send({
          message: "Invalid token",
        });
      }
    } catch (err: any) {
      if (err.message === "jwt expired") {
        return res.status(401).send({
          message: "Token expired",
        });
      } else if (err.message === "invalid signature") {
        return res.status(401).send({
          message: "Invalid token",
        });
      } else {
        return res.status(500).send({
          message: "Something went wrong",
          err,
        });
      }
    }
  } else {
    return res.status(401).send({
      message: "Unauthorized",
    });
  }
};
