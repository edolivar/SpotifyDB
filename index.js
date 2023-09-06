const express = require("express")
const app = express();
app.use(express.json());
const port = process.env.PORT || 8000

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.json({ message: "alive" });
});

app.get("/db/getUsers", async (req, res) => {
  const currentPage = req.query.page || 1;
  const listPerPage = 5;
  const offset = (currentPage - 1) * listPerPage;
 
  const users = await prisma.spotify.findMany({
    skip: offset,
    take: listPerPage,
  });
 
  res.json({
    data: users,
    meta: { page: currentPage },
  });
});
 
app.post('/db/addUser', async(req, res) => {
  const userName = req.query.userName
  if(!userName) {
    return res.status(400).json({ message: "Username is missing" })
  }
  console.log(userName)
  try {
    const user = await prisma.spotify.findFirst({
      where: { name: userName },
    });
      
      if(!user) {
        await prisma.spotify.create({
          data : {
          name: userName,
          }
        })
        console.log("Created user");
        return res.json('Worked');
      }
      else{
        return res.json('already exist')
      }
    }catch (e) {
    console.error(e);
    return res.status(500).json({ message: "something went wrong" });
  }
})

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
