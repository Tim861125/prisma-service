import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// findMany
app.get('/get-users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
  res.json(users)
})

// create
app.post('/add-user', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
    })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: '新增失敗', detail: err })
  }
})

// update
app.put('/update-users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const data = req.body

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    })
    res.json(updatedUser)
  } catch (err) {
    res.status(400).json({ error: '修改失敗', detail: err })
  }
})

// delete
app.delete('/delete-user/:id', async (req, res) => {
  const id = Number(req.params.id)

  try {
    await prisma.user.delete({
      where: { id },
    })
    res.json({ message: `使用者 ${id} 刪除成功` })
  } catch (err) {
    res.status(400).json({ error: '刪除失敗', detail: err })
  }
})

// findUnique
app.post('/findUnique-user', async (req, res) => {
  const { email } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: '查詢失敗', detail: err })
  }
})

// findFirst
app.post('/find-first-user', async (req, res) => {
  const { role } = req.body

  try {
    const user = await prisma.user.findFirst({
      where: { role },
      orderBy: { id: 'asc' },
    })
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: '查詢失敗', detail: err })
  }
})

// createMany
app.post('/create-users', async (req, res) => {
  const { users } = req.body

  try {
    const createdUsers = await prisma.user.createMany({
      data: users,
    })
    res.json({ count: createdUsers.count })
  } catch (err) {
    res.status(400).json({ error: '批量新增失敗', detail: err })
  }
})

// updateMany
app.post('/update-users', async (req, res) => {
  const { role, isActive } = req.body

  try {
    const updated = await prisma.user.updateMany({
      where: { role },
      data: { isActive },
    })
    res.json({ count: updated.count })
  } catch (err) {
    res.status(400).json({ error: '批量更新失敗', detail: err })
  }
})

app.post('/add-house', async (req, res) => {
  const { address, userId } = req.body
  try {
    const house = await prisma.house.create({
      data: {
        address,
        user: {
          connect: { id: userId }
        }
      }
    })
    res.json(house)
  } catch (err) {
    res.status(400).json({ error: '新增房子失敗', detail: err })
  }
})

app.get('/user-houses/:id', async (req, res) => {
  const userId = Number(req.params.id)

  try {
    const userWithHouses = await prisma.user.findUnique({
      where: { id: userId },
      include: { houses: true },
    })

    res.json(userWithHouses?.houses)
  } catch (err) {
    res.status(500).json({ error: '查詢失敗', detail: err })
  }
})

app.post('/create-houses', async (req, res) => {
  const { houses } = req.body

  try {
    const createdHouses = await prisma.house.createMany({
      data: houses,
    })
    res.json({ count: createdHouses.count })
  } catch (err) {
    res.status(400).json({ error: '批量新增失敗', detail: err })
  }
})


// groupBy
app.get('/group-by-role', async (req, res) => {
  try {
    const groupByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        _count: {
          role: 'asc',
        },
      },
    })
    res.json(groupByRole)
  } catch (err) {
    res.status(500).json({ error: '分組查詢失敗', detail: err })
  }
})

app.get('/distinct-roles', async (req, res) => {
  try {
    const distinctRoles = await prisma.user.findMany({
      distinct: ['role'],
      select: {
        role: true,
      },
    })
    res.json(distinctRoles.map(item => item.role))
  } catch (err) {
    res.status(500).json({ error: 'Distinct 查詢失敗', detail: err })
  }
})

// Transaction
app.post('/create-user-and-house', async (req, res) => {
  const { userData, houseData } = req.body

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: userData,
      })

      const newHouse = await prisma.house.create({
        data: {
          address: houseData.address,
          user: {
            connect: { id: newUser.id },
          },
        },
      })

      return { newUser, newHouse }
    })

    res.json(result)
  } catch (err) {
    res.status(400).json({ error: '新增失敗', detail: err })
  }
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
