const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at Port: 3000");
    });
  } catch (error) {
    console.log(`Database Error is: ${error.message}`);
    process.exit(1);
  }
};

initializeDbServer();

const convertingToResponseObject = (resObj) => {
  return {
    movieId: resObj.movie_id,
    directorId: resObj.director_Id,
    movieName: resObj.movie_name,
    leadActor: resObj.lead_actor,
  };
};

app.get("/movies/", async (req, res) => {
  const moviesQuery = `SELECT movie_name FROM movie;`;
  const movies = await db.all(moviesQuery);
  res.send(movies.map((eachMovie) => convertingToResponseObject(eachMovie)));
});

app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const postMovieQuery = `INSERT INTO 
                                movie(director_id, movie_name, lead_actor)
                              VALUES(
                                  ${directorId},
                                  '${movieName}',
                                  '${leadActor}');`;
  const createdMovie = await db.run(postMovieQuery);
  res.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `SELECT movie_id, director_id, movie_name, lead_actor FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  res.send(convertingToResponseObject(movie));
});

app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const putMovieQuery = `UPDATE 
                                movie 
                             SET 
                               director_id = ${directorId},
                                movie_name = '${movieName}',
                                lead_actor = '${leadActor}'
                             WHERE 
                                movie_id = ${movieId};`;
  const updatedMovie = await db.run(putMovieQuery);
  res.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

const convertToDirectorObj = (resObj) => {
  return {
    directorId: resObj.director_id,
    directorName: resObj.director_name,
  };
};

app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directors = await db.all(getDirectorsQuery);
  res.send(directors.map((eachDirector) => convertToDirectorObj(eachDirector)));
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getDirectorIdRelMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = '${directorId}';`;
  const resMovies = await db.all(getDirectorIdRelMoviesQuery);
  res.send(resMovies.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
