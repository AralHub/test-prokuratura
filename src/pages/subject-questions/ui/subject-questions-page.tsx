import { CameraOutlined } from "@ant-design/icons"
import { useParams } from "@tanstack/react-router"
import { Button, Card, Empty, Flex, Image, Spin, Tag, Upload } from "antd"
import type { FC } from "react"
import {
	useAddImage,
	useDeleteQuestion,
	useGetAdminQuestions
} from "src/entities/questions"
import { useGetSubjectsQuery } from "src/entities/subjects"
import {
	SubjectGenerationButton,
	SubjectQuestionsForm
} from "src/features/subject-questions"
import { useToken } from "src/shared/hooks"
import {
	AddButton,
	DeleteButton,
	EditButton,
	ReloadButton
} from "src/shared/ui"
import { PageHeader } from "src/widgets/page-header"

export const SubjectQuestionsPage: FC = () => {
	const { subjectId } = useParams({
		strict: false
	})
	const { data: subjects } = useGetSubjectsQuery()

	const subject = subjects?.data?.find(
		(item) => Number(item?.id) === Number(subjectId)
	)

	const { mutate: deleteQuestion } = useDeleteQuestion()
	const { mutate: addImage } = useAddImage()

	const {
		token: { colorWhite }
	} = useToken()

	const {
		data: questions,
		isLoading,
		isFetching,
		refetch
	} = useGetAdminQuestions(subjectId, "by_subject")

	return (
		<>
			<PageHeader
				showBack={true}
				title={"Вопросы предмета: " + subject?.name}
				subtitle={subject?.description}
				extra={[
					<SubjectGenerationButton key={"generate"} />,
					<AddButton text="Добавить вопрос" key={"add"} />,
					<ReloadButton
						loading={isFetching}
						onReload={refetch}
						key={"refetch"}
					/>
				]}
			/>
			<Spin spinning={isLoading}>
				{questions?.data?.length ? (
					questions?.data?.map((item, index) => (
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
											data={item.text}
											onConfirm={() => deleteQuestion(String(item.id))}
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
											whiteSpace: "wrap",
											fontSize: "inherit"
										}}
										color={question?.is_correct ? "green" : "default"}
										key={question?.id}
									>
										{question.text}
									</Tag>
								))}
							</Flex>
						</Card>
					))
				) : (
					<Flex
						style={{
							minHeight: 300
						}}
						align={"center"}
						justify={"center"}
					>
						<Empty />
					</Flex>
				)}
			</Spin>
			<SubjectQuestionsForm />
		</>
	)
}
