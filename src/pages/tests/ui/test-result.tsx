import { Image, Space, Spin, Typography } from "antd"
import type { FC } from "react"
import type { TestResult as TestResultType } from "src/entities/exams"
import { BASE_URL } from "src/shared/config"

const { Title } = Typography

export const TestResult: FC<TestResultType> = ({ total_score, user, loading }) => {

	return (
		<Space direction="vertical" size="large" align="center" style={{ width: "100%" }}>
			{loading ? (
				<Spin />
			) : (
				user?.photo_url && (
					<Image
						src={BASE_URL + user?.photo_url}
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
