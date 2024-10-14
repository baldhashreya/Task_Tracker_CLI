import express, { Request, Response } from "express"; // Correct import statement
import bodyParser from "body-parser";
import fs from "fs/promises";

const app = express(); // Create the Express app using express()
const PORT = 3000;
app.use(bodyParser.json());

async function checkFileExists(file_name: string): Promise<boolean> {
  try {
    await fs.access(file_name);
    return true;
  } catch (err) {
    return false;
  }
}

async function createFile(data: string, file_name: string) {
  try {
    await fs.writeFile(file_name, data);
  } catch (err) {
    console.log("---------err while creating file content", err);
  }
}

async function checkRecordExists(id: number, data: object[]): Promise<Boolean> {
  const new_data = data.find((e: any) => {
    return e.id === id;
  });
  return new_data && new_data ? true : false;
}

function nextId(data: object[]): number {
  const id = data
    .map((e: any) => {
      return e.id;
    })
    .sort();

  return id[id.length - 1] + 1;
}

async function getFileContent(file_name: string) {
  try {
    return fs.readFile(file_name, "utf8");
  } catch (err) {
    console.log("---------err while fetch data", err);
  }
}

app.post("/", async (req: Request, res: Response) => {
  try {
    req.body.id = 1;
    const data = [req.body];
    await createFile(JSON.stringify(data), "test.json");
    res.status(200).json("created successfully!");
  } catch (err) {
    console.log(err);
    res.status(500).json("Failed to create!");
  }
});

app.get("/:id", async (req: Request, res: Response) => {
  const fileExists = await checkFileExists("test.json");
  if (fileExists) {
    const data = await getFileContent("test.json");
    if (await checkRecordExists(+req.params.id, JSON.parse(data || ""))) {
      const new_data = JSON.parse(data || "").filter((e: any) => {
        return +e.id == +req.params.id;
      });
      res.status(200).json(new_data);
    } else {
      res.status(404).json("Record not Found");
    }
  } else {
    res.status(404).json("file Not Found");
  }
});

app.post("/list", async (req: Request, res: Response) => {
  const fileExists = await checkFileExists("test.json");
  if (fileExists) {
    const data = await getFileContent("test.json");
    let new_data = JSON.parse(data || "");
    if (req.body.status) {
      new_data = new_data.filter((e: any) => {
        return e.status === req.body.status;
      });
    }
    if (req.body.is_not_done) {
      new_data = new_data.filter((e: any) => {
        return e.status !== "DONE";
      });
    }
    res.status(200).json(new_data);
  } else {
    res.status(404).json("file Not Found");
  }
});

app.post("/add", async (req: Request, res: Response) => {
  const fileExists = await checkFileExists("test.json");
  if (fileExists) {
    const data = await getFileContent("test.json");
    const new_data = JSON.parse(data || "");
    req.body.id = nextId(new_data);
    new_data.push(req.body);
    await createFile(JSON.stringify(new_data), "test.json");
    res.status(200).json("added successfully");
  } else {
    res.status(400).json(JSON.parse("file Not Found"));
  }
});

app.delete("/:id", async (req: Request, res: Response) => {
  const fileExists = await checkFileExists("test.json");
  if (fileExists) {
    const data = await getFileContent("test.json");
    if (await checkRecordExists(+req.params.id, JSON.parse(data || ""))) {
      const new_data = JSON.parse(data || "").filter((e: any) => {
        return +e.id != +req.params.id;
      });
      await createFile(JSON.stringify(new_data), "test.json");
      res.status(200).json("Delete successfully");
    } else {
      res.status(404).json("Record not Found");
    }
  } else {
    res.status(404).json("file Not Found");
  }
});

app.patch("/:id/change-status", async (req: Request, res: Response) => {
  const fileExists = await checkFileExists("test.json");
  if (fileExists) {
    let data = await getFileContent("test.json");
    console.log("---------data", data);
    if (await checkRecordExists(+req.params.id, JSON.parse(data || ""))) {
      let new_data: any[] = [];
      JSON.parse(data || "").forEach((e: any) => {
        if (e.id === +req.params.id) {
          e.status = req.body.status;
        }
        new_data.push(e);
        return e;
      });
      await createFile(JSON.stringify(new_data), "test.json");
      res.status(200).json("Update SuccessFully");
    } else {
      res.status(404).json("Record not Found");
    }
  } else {
    res.status(400).json("file Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
