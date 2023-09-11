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
})

app.get('/db/top5', async (req, res) => {
  const { id } = req.query 

  const resp = await prisma.song.findMany({
    where: {userId : parseInt(id)},
    orderBy: {count : 'desc'},
    take: 5,
  })

  res.json(resp)
})
 
app.post('/db/addUser', async(req, res) => {
  const userName = req.query.userName
  if(!userName) {
    return res.status(400).json({ message: "Username is missing" })
  }
  console.log(userName)
  try {
    let user = await prisma.user.findFirst({
      where: { name: userName },
    });
      
      if(!user) {
        await prisma.user.create({
          data : {
          name: userName,
          }
        })
        console.log("Created user");
        user = await prisma.user.findFirst({ where: { name: userName }});

        return res.json(user);
      }
      else{
        let user = await prisma.user.findFirst({
      where: { name: userName },
      });
        return res.json(user)
      }
    }catch (e) {
    console.error(e);
    return res.status(500).json({ message: "something went wrong" });
  }
})

app.post('/db/addSong', async (req, res) => {
  const songName = req.query.songName
  const id = req.query.id

  if(!songName || !id) {
    return res.status(400).json({ message: "songName or id is missing" })
  }

  console.log('trying to add song')
  try{
    let entry = await prisma.song.findFirst({
        where: { name: songName, userId: parseInt(id) },
      });
      
      if (!entry) {
        await prisma.song.create({
          data: {name: songName, userId:parseInt(id), count: 1}
        })

        console.log('Created Song for user') 
        entry = await prisma.song.findFirst({
          where: { name: songName, userId: parseInt(id) },
        });
        return res.json(entry)
      } else {
        console.log('entry exist')
        
        entry = await prisma.song.update({
          where: { name: songName, userId: parseInt(id) },
          data: {count : entry.count + 1}
        });
        return res.json(entry)
      }

      
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "something went wrong" });
  }



  
})

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
