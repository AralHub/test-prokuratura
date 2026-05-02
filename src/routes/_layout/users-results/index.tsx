import { createFileRoute } from "@tanstack/react-router"
import { UsersResultsPage } from "src/pages/users-results"

export const Route = createFileRoute("/_layout/users-results/")({
	component: RouteComponent
})

function RouteComponent() {
	return (
		<>
			<UsersResultsPage />
		</>
	)
}
