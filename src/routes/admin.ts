import {
  register,
  login,
  verifySeller,
  createGenre,
  allGenres,
  updateGenre,
  deleteGenre,
  verifyToken,
  allMovies,
  deleteMovie,
  deleteAllMovies,
} from "../controllers/admin";
import { Router } from "express";
import multer from "multer";
const upload = multer();
const router: Router = Router();

router.use(upload.none());

router.post("/add", register);
router.post("/login", login);
router.post("/verify_seller", verifyToken, verifySeller);
router.post("/create_genre", verifyToken, createGenre);
router.get("/all_genres", verifyToken, allGenres);
router.put("/update_genre", verifyToken, updateGenre);
router.delete("/delete_genre/:id", verifyToken, deleteGenre);
router.get("/all_movies", verifyToken, allMovies);
router.delete("/delete_movie/:id", verifyToken, deleteMovie);
router.delete("/delete_all_movies", verifyToken, deleteAllMovies);

export default router;
