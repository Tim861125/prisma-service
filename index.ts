import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";

const app = express();
const prisma = new PrismaClient();

// Middleware to log query execution time
prisma.$use(async (params, next) => {
	const before = Date.now();
	const result = await next(params);
	const after = Date.now();
	console.log(
		`Query ${params.model}.${params.action} took ${after - before}ms`,
	);
	return result;
});

// Prisma Client Extension
const extendedPrisma = prisma.$extends({
	result: {
		user: {
			fullName: {
				needs: { name: true, role: true },
				compute(user) {
					return `${user.name} (${user.role})`;
				},
			},
		},
	},
});

app.use(cors());
app.use(express.json());

// findMany
app.get("/get-users", async (req, res) => {
	const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
	res.json(users);
});

// create
app.post("/add-user", async (req, res) => {
	try {
		const user = await prisma.user.create({
			data: req.body,
		});
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: "add fail", detail: err });
	}
});

// update
app.post("/update-users/:id", async (req, res) => {
	const id = Number(req.params.id);
	const data = req.body;

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data,
		});
		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ error: "update fail", detail: err });
	}
});

// delete
app.delete("/delete-user/:id", async (req, res) => {
	const id = Number(req.params.id);

	try {
		await prisma.user.delete({
			where: { id },
		});
		res.json({ message: `User id: ${id} delete success` });
	} catch (err) {
		res.status(400).json({ error: "delete fail", detail: err });
	}
});

// findUnique
app.post("/findUnique-user", async (req, res) => {
	const { email } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { email },
		});
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: "findUnique fail", detail: err });
	}
});

// findFirst
app.post("/find-first-user", async (req, res) => {
	const { role } = req.body;

	try {
		const user = await prisma.user.findFirst({
			where: { role },
			orderBy: { id: "asc" },
		});
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: "findFirst fail", detail: err });
	}
});

// createMany
app.post("/create-users", async (req, res) => {
	const { users } = req.body;

	try {
		const createdUsers = await prisma.user.createMany({
			data: users,
		});
		res.json({ count: createdUsers.count });
	} catch (err) {
		res.status(400).json({ error: "createMany fail", detail: err });
	}
});

// updateMany
app.post("/update-users", async (req, res) => {
	const { role, isActive } = req.body;

	try {
		const updated = await prisma.user.updateMany({
			where: { role },
			data: { isActive },
		});
		res.json({ count: updated.count });
	} catch (err) {
		res.status(400).json({ error: "updateMany fail", detail: err });
	}
});

app.post("/add-house", async (req, res) => {
	const { address, userId } = req.body;
	try {
		const house = await prisma.house.create({
			data: {
				address,
				user: {
					connect: { id: userId },
				},
			},
		});
		res.json(house);
	} catch (err) {
		res.status(400).json({ error: "create fail", detail: err });
	}
});

app.get("/user-houses/:id", async (req, res) => {
	const userId = Number(req.params.id);

	try {
		const userWithHouses = await prisma.user.findUnique({
			where: { id: userId },
			include: { houses: true },
		});

		res.json(userWithHouses?.houses);
	} catch (err) {
		res.status(500).json({ error: "findUnique fail", detail: err });
	}
});

app.post("/create-houses", async (req, res) => {
	const { houses } = req.body;

	try {
		const createdHouses = await prisma.house.createMany({
			data: houses,
		});
		res.json({ count: createdHouses.count });
	} catch (err) {
		res.status(400).json({ error: "createMany fail", detail: err });
	}
});

// groupBy
app.get("/group-by-role", async (req, res) => {
	try {
		const groupByRole = await prisma.user.groupBy({
			by: ["role"],
			_count: {
				role: true,
			},
			where: {
				isActive: true,
			},
			orderBy: {
				_count: {
					role: "asc",
				},
			},
		});
		res.json(groupByRole);
	} catch (err) {
		res.status(500).json({ error: "groupBy fail", detail: err });
	}
});

app.get("/distinct-roles", async (req, res) => {
	try {
		const distinctRoles = await prisma.user.findMany({
			distinct: ["role"],
			select: {
				role: true,
			},
		});
		res.json(distinctRoles.map((item) => item.role));
	} catch (err) {
		res.status(500).json({ error: "Distinct fail", detail: err });
	}
});

// Transaction
app.post("/create-user-and-house", async (req, res) => {
	const { userData, houseData } = req.body;

	try {
		const result = await prisma.$transaction(async (prisma) => {
			const newUser = await prisma.user.create({
				data: userData,
			});

			const newHouse = await prisma.house.create({
				data: {
					address: houseData.address,
					user: {
						connect: { id: newUser.id },
					},
				},
			});

			return { newUser, newHouse };
		});

		res.json(result);
	} catch (err) {
		res.status(400).json({ error: "transaction fail", detail: err });
	}
});

// Upsert
app.post("/upsert-user", async (req, res) => {
	const { email, name, phone, role, isActive } = req.body;

	try {
		const user = await prisma.user.upsert({
			where: { email },
			update: { name, phone, role, isActive },
			create: { email, name, phone, role, isActive },
		});
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: "Upsert fail", detail: err });
	}
});

// Aggregate
app.get("/aggregate-users", async (req, res) => {
	try {
		const summary = await prisma.user.aggregate({
			_count: {
				id: true,
			},
			_avg: {
				age: true,
			},
			_sum: {
				age: true,
			},
			_min: {
				age: true,
			},
			_max: {
				age: true,
			},
		});
		res.json(summary);
	} catch (err) {
		res.status(500).json({ error: "aggregate fail", detail: err });
	}
});

// Pagination
app.get("/users-paginated", async (req, res) => {
	const page = Number(req.query.page) || 1;
	const pageSize = Number(req.query.pageSize) || 10;
	const skip = (page - 1) * pageSize;

	try {
		const users = await prisma.user.findMany({
			skip,
			take: pageSize,
			orderBy: { id: "asc" },
		});
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: "Pagination fail", detail: err });
	}
});

// Advanced Filtering
app.get("/users-filtered", async (req, res) => {
	const { emailContains, ageGt } = req.query;

	try {
		const users = await prisma.user.findMany({
			where: {
				email: {
					contains: emailContains ? String(emailContains) : undefined,
				},
				age: {
					gt: ageGt ? Number(ageGt) : undefined,
				},
			},
		});
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: "Filtering fail", detail: err });
	}
});

// Relational Filters
app.get("/users-with-house-in", async (req, res) => {
	const { address } = req.query;

	try {
		const users = await prisma.user.findMany({
			where: {
				houses: {
					some: {
						address: {
							contains: String(address),
						},
					},
				},
			},
		});
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: "Relational filtering fail", detail: err });
	}
});

// Nested Writes
app.post("/create-user-with-houses", async (req, res) => {
	const { userData, housesData } = req.body;

	try {
		const newUser = await prisma.user.create({
			data: {
				...userData,
				houses: {
					create: housesData,
				},
			},
			include: {
				houses: true,
			},
		});
		res.json(newUser);
	} catch (err) {
		res.status(400).json({ error: "Nested write fail", detail: err });
	}
});

// Atomic Number Operations
app.post("/increment-user-age/:id", async (req, res) => {
	const id = Number(req.params.id);

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				age: {
					increment: 1,
				},
			},
		});
		res.json(updatedUser);
	} catch (err) {
		res.status(400).json({ error: "Atomic operation fail", detail: err });
	}
});

// Prisma Client Extension Usage
app.get("/user-fullname/:id", async (req, res) => {
	const id = Number(req.params.id);
	try {
		const user = await extendedPrisma.user.findUnique({
			where: { id },
		});
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: "Extension fail", detail: err });
	}
});

// Raw SQL Query
app.get("/users-raw-sql", async (req, res) => {
	const ageGt = Number(req.query.ageGt) || 0;
	try {
		const users =
			await prisma.$queryRaw`SELECT * FROM "User" WHERE age > ${ageGt}`;
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: "Raw SQL query fail", detail: err });
	}
});

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
