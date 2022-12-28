import jsonWebToken from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Cryptr from "cryptr";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const prisma = new PrismaClient();
const cryptr = new Cryptr(process.env.SECRET_KEY || "SECRET_KEY");

export const register = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: cryptr.encrypt(req.body.password),
        subscription: {
          create: {
            subscription: "FREE",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const token = jsonWebToken.sign(
      {
        id: user.id,
      },
      process.env.SECRET_KEY || "SECRET_KEY",
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).send({
      message: "User registered successfully",
      user,
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
    const user = await prisma.user.findUnique({
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
    if (user) {
      const decryptedPassword = cryptr.decrypt(user.password);
      if (decryptedPassword === req.body.password) {
        const token = jsonWebToken.sign(
          {
            id: user.id,
          },
          process.env.SECRET_KEY || "SECRET_KEY",
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).send({
          message: "User logged in successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
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
        message: "User not found",
      });
    }
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
        thumbNailPath: true,
        year: true,
        director: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
            User: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const avg = await prisma.review.groupBy({
      by: ["movieId"],
      _avg: {
        rating: true,
      },
    });
    const avgMap = new Map();

    avg.forEach((item) => {
      avgMap.set(item.movieId, item._avg.rating);
    });

    movies.forEach((movie: any) => {
      movie.avgRating = avgMap.get(movie.id);
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

export const topMovies = async (req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: [
        {
          reviews: {
            _count: "desc",
          },
        },
      ],
      take: 10,
      select: {
        id: true,
        title: true,
        thumbNailPath: true,
        year: true,
        director: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
            User: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const avg = await prisma.review.groupBy({
      by: ["movieId"],
      _avg: {
        rating: true,
      },
    });

    const avgMap = new Map();

    avg.forEach((item) => {
      avgMap.set(item.movieId, item._avg.rating);
    });

    movies.forEach((movie: any) => {
      // if there are any movies with out reviews, then movie.avgRating should be 0.
      movie.avgRating = avgMap.has(movie.id) ? avgMap.get(movie.id) : 0;
    });

    // sort movies by avg rating
    movies.sort((a: any, b: any) => b.avgRating - a.avgRating);

    console.log(movies);

    return res.status(200).send({
      message: "Top 10 movies",
      movies,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const giveRating = async (req: any, res: Response) => {
  try {
    // check if user has already rated the movie
    const rating = await prisma.review.findFirst({
      where: {
        movieId: Number(req.body.movieId),
        userId: req.user_id,
      },
      select: {
        id: true,
      },
    });
    if (rating) {
      const updateRating = await prisma.review.update({
        where: {
          id: rating.id,
        },
        data: {
          rating: Number(req.body.rating),
          review: req.body.review,
          Movie: {
            connect: {
              id: Number(req.body.movieId),
            },
          },
          User: {
            connect: {
              id: req.user_id,
            },
          },
        },
        select: {
          id: true,
          rating: true,
          review: true,
          Movie: {
            select: {
              id: true,
              title: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (updateRating) {
        return res.status(200).send({
          message: "Rating updated successfully",
        });
      } else {
        return res.status(400).send({
          message: "Something went wrong",
        });
      }
    } else {
      const newRating = await prisma.review.create({
        data: {
          rating: Number(req.body.rating),
          review: req.body.review,
          Movie: {
            connect: {
              id: Number(req.body.movieId),
            },
          },
          User: {
            connect: {
              id: req.user_id,
            },
          },
        },
        select: {
          id: true,
          rating: true,
          review: true,
          Movie: {
            select: {
              id: true,
              title: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (newRating) {
        return res.status(200).send({
          message: "Rating given successfully",
        });
      } else {
        return res.status(400).send({
          message: "Something went wrong",
        });
      }
    }
  } catch (err) {
    return res.status(500).send({
      message: "Something went wrong",
      err,
    });
  }
};

export const getSingleMovie = async (req: Request, res: Response) => {
  try {
    const movie: any = await prisma.movie.findFirst({
      where: {
        id: Number(req.params.id),
      },
      select: {
        id: true,
        title: true,
        thumbNailPath: true,
        year: true,
        director: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
            User: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const avg = await prisma.review.groupBy({
      by: ["movieId"],
      _avg: {
        rating: true,
      },
    });

    const avgMap = new Map();

    avg.forEach((item) => {
      avgMap.set(item.movieId, item._avg.rating);
    });

    if (movie) {
      movie.avgRating = avgMap.has(movie.id) ? avgMap.get(movie.id) : 0;
    }

    return res.status(200).send({
      message: "Movie details",
      movie,
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
      const decoded: any = jsonWebToken.verify(
        req.token,
        process.env.SECRET_KEY || "SECRET_KEY"
      );
      if (decoded) {
        req.user_id = decoded.id;
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
