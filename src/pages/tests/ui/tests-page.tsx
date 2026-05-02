import { ClockCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { useNavigate } from "@tanstack/react-router"
import {
	Button,
	Card,
	Col,
	Empty,
	Flex,
	Progress,
	Row,
	Space,
	Spin,
	Typography
} from "antd"
import { useGetExamsSubjects, useStartTest } from "src/entities/exams"
import { useGetMeQuery } from "src/features/auth/api/api"
import { useMessage, useToken } from "src/shared/hooks"
import { useCameraStore } from "src/shared/store"
import { ReloadButton } from "src/shared/ui"
import { PageHeader } from "src/widgets/page-header"

const getPercent = (current?: number, total?: number) => {
	if (!current) return 0
	if (!total) return 0
	return Math.round((current * 100) / total)
}

export const TestsPage = () => {
	const { data: exams, isLoading, isFetching, refetch } = useGetExamsSubjects()
	const navigate = useNavigate()
	const { mutate: startTest, isPending: startLoading } = useStartTest()
	const { token } = useToken()
	const { message } = useMessage()
	const { setIsModalOpen } = useCameraStore()
	

	const { data: user } = useGetMeQuery()

	const handleStartTest = (id: number) => {
		if (user?.data?.photo_url) {
			startTest(id)
			navigate({
				to: "/tests/$testId",
				params: { testId: String(id) }
			})
		} else {
			message.error({
				message: "Ошибка",
				description:
					"Для начала теста необходимо загрузить фото профиля. Пожалуйста, загрузите фото в настройках профиля."
			})
			setIsModalOpen(true)
		}
	}

	return (
		<>
			<PageHeader
				title={"Тесты"}
				extra={
					<ReloadButton
						loading={isFetching}
						onReload={refetch}
						children={"Обновить"}
					/>
				}
			/>
			<Spin spinning={isLoading}>
				{exams?.data?.length ? (
					<Row gutter={24} style={{ rowGap: 24 }}>
						{exams?.data?.map((el, index) => {
							const percent = getPercent(el?.total_score, el?.questions_count)
							return (
								<Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6} key={index}>
									<Card variant={"outlined"}>
										<Typography.Title
											level={3}
											style={{ color: token.colorPrimary, marginBottom: 8 }}
										>
											{el?.title}
										</Typography.Title>
										<Space split={"•"} style={{ marginBottom: 16 }}>
											<div>
												<ClockCircleOutlined /> {el?.time_limit_minutes} мин
											</div>
											<div>
												<QuestionCircleOutlined /> {el?.questions_count}{" "}
												вопросов
											</div>
										</Space>
										{el?.passed || el?.is_expired ? (
											<div>
												<Flex justify={"center"}>
													<Progress
														status={
															percent === 0
																? "exception"
																: percent === 100
																	? "success"
																	: "normal"
														}
														type={"circle"}
														percent={percent}
														format={() =>
															`${el?.total_score}/${el?.questions_count}`
														}
													/>
												</Flex>
												<Typography.Paragraph
													type={"secondary"}
													style={{ textAlign: "center" }}
												>
													Вы набрали {percent}%
												</Typography.Paragraph>
											</div>
										) : (
											<div>
												<div style={{ height: 108, overflow: "hidden" }}>
													<Typography.Paragraph
														ellipsis={{
															rows: 4
														}}
													>
														<blockquote>{el.description}</blockquote>
													</Typography.Paragraph>
												</div>
												<Button
													block={true}
													disabled={startLoading}
													type={"primary"}
													onClick={() => handleStartTest(el.id!)}
												>
													Начать тест
												</Button>
											</div>
										)}
									</Card>
								</Col>
							)
						})}
					</Row>
				) : (
					<Empty />
				)}
			</Spin>
		</>
	)
}
