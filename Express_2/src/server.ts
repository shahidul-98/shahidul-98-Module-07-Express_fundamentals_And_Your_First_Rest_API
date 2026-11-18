import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const app: Application = express();
const port = 5000;

app.get("/", (req: Request, res: Response) => {
  //   console.log(req);
  //   res.send("Hello Express Js");
  res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PH_B8_SIL",
  });
});

app.post("/", async (req: Request, res: Response) => {
  console.log(req.body);
  //   res.status(200).json({
  //     success: true,
  //     message: "Post the data successfully",
  //     author: "PH_POST_SIL",
  //   });
});

app.listen(port, () => {
  console.log(`Server is running at port: ${5000}`);
});
