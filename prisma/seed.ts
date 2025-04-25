import { faker } from "@faker-js/faker"
import { prisma } from "../src/infrastructure/prisma"

async function main() {
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.application.deleteMany()
  await prisma.jobSkill.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.job.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.skill.deleteMany()

  const skillNames = ["React", "Node.js", "TypeScript", "Go", "PostgreSQL"]
  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )

  for (let i = 0; i < 6; i++) {
    const role = i < 3 ? "CLIENT" : "FREELANCER"
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role,
        profile: {
          create: {
            name: faker.person.fullName(),
            bio: faker.lorem.sentence(),
            avatarUrl: faker.image.avatar(),
          },
        },
      },
    })

    for (const skill of skills.slice(0, 2)) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: skill.id,
        },
      })
    }

    if (role === "CLIENT") {
      for (let j = 0; j < 2; j++) {
        const job = await prisma.job.create({
          data: {
            clientId: user.id,
            title: faker.lorem.words(4),
            description: faker.lorem.paragraph(),
            budget: faker.number.float({ min: 300, max: 2000 }),
            skills: {
              create: skills.slice(0, 2).map((s) => ({
                skill: { connect: { id: s.id } },
              })),
            },
          },
        })

        const freelancers = await prisma.user.findMany({
          where: { role: "FREELANCER" },
        })
        for (const freelancer of freelancers) {
          await prisma.application.create({
            data: {
              jobId: job.id,
              userId: freelancer.id,
              resumeUrl: faker.internet.url(),
            },
          })
        }
      }
    }
  }
}

main()
  .then(() => console.log("🌱 Seed completed!"))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
