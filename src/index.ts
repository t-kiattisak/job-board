import { Hono } from "hono"
import authRoute from "./routes/auth.route"
import jobRoute from "./routes/job.route"
import applicationRoute from "./routes/application.route"
import reviewRoute from "./routes/review.route"
import userRoute from "./routes/user.route"
import dashboardRoute from "./routes/dashboard.route"
import messageRoute from "./routes/message.route"
import exportRoute from "./routes/export.route"

const app = new Hono()

app.get("/", (c) => c.text("Job Board API is running"))
app.route("/auth", authRoute)
app.route("/jobs", jobRoute)
app.route("/applications", applicationRoute)
app.route("/reviews", reviewRoute)
app.route("/users", userRoute)
app.route("/dashboard", dashboardRoute)
app.route("/messages", messageRoute)
app.route("/export", exportRoute)

export default app
