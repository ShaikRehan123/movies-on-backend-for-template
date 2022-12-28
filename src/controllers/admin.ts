import jsonWebToken from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Cryptr from "cryptr";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import * as fs from "fs";

const prisma = new PrismaClient();
const cryptr = new Cryptr(process.env.SECRET_KEY || "SECRET_KEY");

export const register = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: cryptr.encrypt(req.body.password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const token = jsonWebToken.sign(
      {
        id: admin.id,
      },
      process.env.SECRET_KEY || "SECRET_KEY",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).send({
      message: "Admin added successfully",
      admin,
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
    const admin = await prisma.admin.findUnique({
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
    if (admin) {
      const decryptedPassword = cryptr.decrypt(admin.password);
      if (decryptedPassword === req.body.password) {
        const token = jsonWebToken.sign(
          {
            id: admin.id,
          },
          process.env.SECRET_KEY || "SECRET_KEY",
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          message: "Admin logged in successfully",
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
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
        message: "Admin not found",
      });
    }
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const verifySeller = async (req: Request, res: Response) => {
  try {
    const seller = await prisma.seller.update({
      where: {
        id: Number(req.body.sellerId),
      },
      data: {
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });
    return res.status(200).send({
      message: "Seller verified successfully",
      seller,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const createGenre = async (req: Request, res: Response) => {
  try {
    const genre = await prisma.genre.create({
      data: {
        name: req.body.name,
      },
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).send({
      message: "Genre created successfully",
      genre,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(400).send({
          message: "Duplicate genre",
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

export const updateGenre = async (req: Request, res: Response) => {
  try {
    const genre = await prisma.genre.update({
      where: {
        id: Number(req.body.id),
      },
      data: {
        name: req.body.name,
      },
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).send({
      message: "Genre updated successfully",
      genre,
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return res.status(400).send({
          message: "Genre not found",
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

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const genre = await prisma.genre.delete({
      where: {
        id: Number(req.params.id),
      },
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).send({
      message: "Genre deleted successfully",
      genre,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const allGenres = async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).send({
      message: "All genres",
      genres,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const allMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res.status(200).send({
      message: "All movies",
      movies,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const movie = await prisma.movie.delete({
      where: {
        id: Number(req.params.id),
      },
      select: {
        id: true,
        title: true,
      },
    });
    return res.status(200).send({
      message: "Movie deleted successfully",
      movie,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const deleteAllMovies = async (req: Request, res: Response) => {
  try {
    fs.rmdirSync("public/uploads/movies", { recursive: true });
    fs.rmdirSync("public/uploads/thumbnails", { recursive: true });

    await prisma.movie.deleteMany();
    return res.status(200).send({
      message: "All movies deleted successfully",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
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
      const decoded = jsonWebToken.verify(
        req.token,
        process.env.SECRET_KEY || "SECRET_KEY"
      );
      if (decoded) {
        next();
      } else {
        return res.status(401).send({
          message: "Unauthorized",
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
