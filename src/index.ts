import { Hono } from "hono"
import authRoute from "./routes/auth.route"
import jobRoute from "./routes/job.route"
import applicationRoute from "./routes/application.route"

const app = new Hono()

app.route("/auth", authRoute)
app.route("/jobs", jobRoute)
app.route("/applications", applicationRoute)

export default app
