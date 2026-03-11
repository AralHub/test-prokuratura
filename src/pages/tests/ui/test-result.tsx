import type { FC } from "react"
import { Typography, Space, Image, Spin } from "antd"
import type { TestResult as TestResultType } from "src/entities/exams"
import { useGetMeQuery } from "src/features/auth/api/api"
import { BASE_URL } from "src/shared/config"

const { Title } = Typography

export const TestResult: FC<TestResultType> = ({ total_score }) => {
	const { data: user, isLoading } = useGetMeQuery()

	return (
		<Space direction="vertical" size="large" align="center" style={{ width: "100%" }}>
			{isLoading ? (
				<Spin />
			) : (
				user?.data?.photo_url && (
					<Image
						src={BASE_URL + user?.data?.photo_url}
						alt="Фото с тестирования"
						width={200}
						style={{ borderRadius: 8, objectFit: "cover" }}
					/>
				)
			)}
			<Title level={4} style={{ margin: 0, textAlign: "center" }}>
				Ваш результат: {total_score} правильных
			</Title>
		</Space>
	)
}
