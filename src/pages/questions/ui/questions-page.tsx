import { ArrowLeftOutlined, CameraOutlined } from "@ant-design/icons"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Button, Card, Flex, Image, Space, Tag, Typography, Upload } from "antd"
import {
	useAddImage,
	useDeleteQuestionByExam,
	useGetAdminQuestions
} from "src/entities/questions"
import { QuestionsForm } from "src/features/questions"
import { useToken } from "src/shared/hooks"
import { AddButton, DeleteButton, EditButton, ReloadButton } from "src/shared/ui"

const { Title } = Typography

export const QuestionsPage = () => {
	const { examId } = useParams({ strict: false })
	const {
		token: { colorWhite }
	} = useToken()
	const { data: questions, refetch, isFetching } = useGetAdminQuestions(examId)
	const { mutate: deleteQuestion } = useDeleteQuestionByExam(examId)
	const { mutate: addImage } = useAddImage()
	const navigate = useNavigate()

	return (
		<>
			<Flex vertical={true}>
				<Flex justify="space-between" style={{ padding: "20px 0px" }}>
					<Title level={2}>
						<ArrowLeftOutlined
							style={{ marginRight: 20 }}
							onClick={() => navigate({ to: "/exams" })}
						/>
						Вопросы
					</Title>
					<Space>
						<AddButton text="Добавить вопрос" />
						<ReloadButton onClick={() => refetch()} loading={isFetching} />
					</Space>
				</Flex>
				{questions?.data?.map((item, index) => (
					<Card
						key={item.id}
						style={{ backgroundColor: colorWhite, marginTop: 20 }}
						title={
							<Flex justify="space-between" align="center" gap={16}>
								<Flex
									gap={10}
									style={{
										whiteSpace: "wrap",
										paddingBlock: 8
									}}
								>
									<span>{index + 1}.</span>
									{item.text}
								</Flex>
								<Flex gap={10}>
									<EditButton params={item} />
									<Upload
										showUploadList={false}
										beforeUpload={(file) => {
											addImage({ question_id: item.id, image: file })
											return false
										}}
									>
										<Button
											type="primary"
											icon={<CameraOutlined style={{ fontSize: 20 }} />}
										/>
									</Upload>
									<DeleteButton
										data={item?.text}
										title={`Вы действительно хотите убрать "${item?.text || ""}"?`}
										onConfirm={() => deleteQuestion(String(item.id))}
										okText={"Да"}
										cancelText={"Нет"}
									/>
								</Flex>
							</Flex>
						}
					>
						{item.image_url && (
							<Flex justify="center">
								<Image
									width={200}
									height={200}
									src={item.image_url}
									style={{ padding: "20px 0px" }}
								/>
							</Flex>
						)}
						<Flex vertical={true} gap={10} style={{ marginTop: 20 }}>
							{item.options.map((question) => (
								<Tag
									style={{
										padding: "10px",
										borderRadius: 5,
										whiteSpace: "wrap"
									}}
									color={question?.is_correct ? "green" : "default"}
									key={question.text}
								>
									{question.text}
								</Tag>
							))}
						</Flex>
					</Card>
				))}
			</Flex>
			<QuestionsForm />
		</>
	)
}
