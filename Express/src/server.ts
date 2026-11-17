import express, {
  response,
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config";
const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: config.connection_string,
});
// console.log(pool);

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255), 
        email VARCHAR(255) UNIQUE NOT NULL, 
        password VARCHAR(255) NOT NULL,
        age INT, 
        is_Active BOOLEAN DEFAULT true,

        created_at TIMESTAMP DEFAULT NOW(),
        update_at TIMESTAMP DEFAULT NOW()
      );  
    `);
    console.log("Database Connected!!");
  } catch (error) {
    console.log(error);
  }
};

initDB();
app.get("/", (req: Request, res: Response) => {
  //   res.send("Hell Express JS:This is root router");
  //   console.log(req);
  res.status(200).json({
    success: true,
    message: "This is root route",
    author: "PH",
  });
});

//To Register New Users
app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    // const body = req.body;
    const { name, email, password, age } = req.body;
    // console.log(password);
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, age) VALUES
    ($1, $2, $3, $4) RETURNING * 
  `,
      [name, email, password, age],
    );
    console.log(result);
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      // data: body,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      // data: body,
      error: error,
    });
  }
});

//To GET All Users
app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM users
      `,
    );
    // console.log(result);
    res.status(200).json({
      success: true,
      message: "All User Retrived Successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

// To Get Single Users
app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    // const { name, password, age, is_Active } = req.body;
    const { id } = req.params; // req.params.id
    const result = await pool.query(
      `
      SELECT * FROM users 
      WHERE id = $1  
    `,
      [id],
    );
    // console.log(result);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }
    res.status(200).json({
      success: true,
      messsage: "Single User Retrived Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

//To update single data using edit
app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password, age, is_Active } = req.body;

    const result = await pool.query(
      `
      UPDATE users 
      SET 
        name =COALESCE($1, name),
        password = COALESCE($2, password),
        age = COALESCE($3, age),
        is_Active = COALESCE($4, is_Active)        
      WHERE id = $5 RETURNING * 
      `,
      [name ?? null, password ?? null, age ?? null, is_Active ?? null, id],
    );
    // console.log(result);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }
    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      date: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

// To delete single users
app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
        DELETE FROM users WHERE id= $1 
      `,
      [id],
    );
    // console.log(result);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      error: error,
    });
  }
});

app.listen(config.port, () => {
  console.log(`The Express server is running on the Port: ${config.port}`);
});
