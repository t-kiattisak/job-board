import { Hono } from "hono"
import authRoute from "./routes/auth.route"
import jobRoute from "./routes/job.route"

const app = new Hono()

app.route("/auth", authRoute)
app.route("/jobs", jobRoute)

export default app
