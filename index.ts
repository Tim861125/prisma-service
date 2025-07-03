import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.get('/get-users', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
  res.json(users)
})

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

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
