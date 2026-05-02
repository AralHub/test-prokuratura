import {
	EyeOutlined,
	FileAddOutlined,
	QuestionCircleOutlined
} from "@ant-design/icons"
import { Link } from "@tanstack/react-router"
import { Button, Card, Col, Empty, Row, Spin, Typography, Upload } from "antd"
import { type FC } from "react"
import {
	useCreateSubjectsQuestionFile,
	useDeleteSubjectsMutation,
	useGetSubjectsQuery
} from "src/entities/subjects"
import { SubjectsForm } from "src/features/subjects"
import {
	AddButton,
	DeleteButton,
	EditButton,
	ReloadButton
} from "src/shared/ui"
import { PageHeader } from "src/widgets/page-header"

export const SubjectsPage: FC = () => {
	const {
		data: subjects,
		isLoading,
		isFetching,
		refetch
	} = useGetSubjectsQuery()

	const { mutate: deleteSubject } = useDeleteSubjectsMutation()
	const { mutate: addFile } = useCreateSubjectsQuestionFile()

	return (
		<>
			<PageHeader
				title={"Предметы"}
				extra={[
					<Button
						children={"Образец документа"}
						key={"document"}
						icon={<FileAddOutlined />}
						href={"/assets/test-platforma.docx"}
						target={"_blank"}
					/>,
					<AddButton text={"Добавить предмет"} key={"add"} />,
					<ReloadButton
						loading={isFetching}
						onReload={refetch}
						key={"refetch"}
					/>
				]}
			/>
			<Spin spinning={isLoading}>
				{subjects?.data?.length ? (
					<Row gutter={24} style={{ rowGap: 24 }}>
						{subjects?.data?.map((el, index) => (
							<Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6} key={index}>
								<Card
									variant={"outlined"}
									actions={[
										<Link
											key={"View"}
											to={"/subjects/$subjectId"}
											params={{
												subjectId: String(el?.id)
											}}
										>
											<Button
												variant={"outlined"}
												color={"primary"}
												icon={<EyeOutlined />}
											/>
										</Link>,
										<Upload
											key={"File"}
											showUploadList={false}
											accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
											beforeUpload={(file) => {
												addFile({ subject_id: el.id, file })
												return false
											}}
										>
											<Button
												type="primary"
												icon={<FileAddOutlined style={{ fontSize: 20 }} />}
											/>
										</Upload>,
										<EditButton
											key={"Edit"}
											style={{}}
											variant={"outlined"}
											color={"orange"}
											params={el}
										/>,
										<DeleteButton
											key={"Delete"}
											onConfirm={() => {
												deleteSubject(el?.id)
											}}
											data={el?.name}
										/>
									]}
								>
									<Typography.Title level={4} style={{ marginBottom: 8 }}>
										{el?.name}
									</Typography.Title>
									<div>
										<QuestionCircleOutlined /> {el?.questions_count || 0}{" "}
										вопросов
									</div>
									<div>
										<Typography.Paragraph
											ellipsis={{
												rows: 4
											}}
											style={{
												height: 60
											}}
										>
											<blockquote>{el?.description}</blockquote>
										</Typography.Paragraph>
									</div>
								</Card>
							</Col>
						))}
					</Row>
				) : (
					<Empty />
				)}
			</Spin>
			<SubjectsForm />
		</>
	)
}
