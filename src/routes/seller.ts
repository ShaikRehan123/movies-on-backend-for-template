import {
  register,
  login,
  uploadMovie,
  verifyToken,
} from "../controllers/seller";
import { Router } from "express";
import multer from "multer";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";

export const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req: any, file, cb) => {
    const ext = file.mimetype.split("/")[1];

    if (file.fieldname === "movie") {
      const uploadPath = `uploads/movies/${
        req.dataFromMiddleware.seller_id
      }/${req.body.title.split(" ").join("_")}_${new Date().getTime()}`;

      fs.mkdirSync(
        `public/uploads/movies/${req.dataFromMiddleware.seller_id}`,
        {
          recursive: true,
        }
      );
      req.dataFromMiddleware = {
        ...req.dataFromMiddleware,
        uploadPath: uploadPath + "." + ext,
      };
      cb(null, uploadPath + "." + ext);
    }
    if (file.fieldname === "thumbnail") {
      const thumbNailPath = `uploads/thumbnails/${
        req.dataFromMiddleware.seller_id
      }/${req.body.title.split(" ").join("_")}_${new Date().getTime()}`;

      fs.mkdirSync(
        `public/uploads/thumbnails/${req.dataFromMiddleware.seller_id}`,
        {
          recursive: true,
        }
      );
      req.dataFromMiddleware = {
        ...req.dataFromMiddleware,
        thumbNailPath: thumbNailPath + "." + ext,
      };
      cb(null, thumbNailPath + "." + ext);
    }
  },
});

export const multerFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === "movie") {
    if (file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

  if (file.fieldname === "thumbnail") {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const router: Router = Router();
const prisma = new PrismaClient();

router.post("/register", upload.none(), register);
router.post("/login", upload.none(), login);
router.post(
  "/upload_movie",
  verifyToken,
  upload.fields([
    { name: "movie", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadMovie,
  async (req: any, res: any) => {
    if (req.dataFromMiddleware?.movie_id) {
      try {
        const updatedMovie = await prisma.movie.update({
          where: {
            id: req.dataFromMiddleware.movie_id,
          },
          data: {
            uploadPath: req.dataFromMiddleware.uploadPath,
            thumbNailPath: req.dataFromMiddleware.thumbNailPath,
          },
          select: {
            id: true,
            title: true,
            director: true,
            year: true,
            uploadPath: true,
            thumbNailPath: true,
          },
        });

        if (updatedMovie) {
          return res.status(200).send({
            message: "Movie uploaded successfully",
            movie: updatedMovie,
          });
        }
      } catch (err) {
        return res.status(500).send({
          message: "Error uploading movie",
          error: err || "Something went wrong",
        });
      }
    } else {
      return res.status(400).send({
        message: "Movie not uploaded",
        error: req.dataFromMiddleware?.error || "Unknown error",
      });
    }
  }
);

export default router;
