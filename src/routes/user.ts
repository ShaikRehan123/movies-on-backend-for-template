import {
  register,
  login,
  topMovies,
  verifyToken,
  giveRating,
  allMovies,
  getSingleMovie,
} from "../controllers/user";
import { Router } from "express";
import multer from "multer";
const upload = multer();
const router: Router = Router();

router.use(upload.none());

router.post("/register", register);
router.post("/login", login);
router.get("/top_movies", topMovies);
router.get("/all_movies", allMovies);
router.post("/give_rating", verifyToken, giveRating);
router.get("/get_single_movie/:id", verifyToken, getSingleMovie);

export default router;
