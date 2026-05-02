import { HolderOutlined } from "@ant-design/icons"
import type { DragEndEvent } from "@dnd-kit/core"
import {
	closestCorners,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors
} from "@dnd-kit/core"
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { CardProps, RadioChangeEvent } from "antd"
import { Card, Checkbox, Flex, Image, Radio, Tag } from "antd"
import { css, cx, useResponsive } from "antd-style"
import { forwardRef, useState } from "react"
import type { Answer } from "src/entities/exams"
import type { Questions, Variant } from "src/entities/questions"
import { useToken } from "src/shared/hooks"

export interface TextItemProps extends CardProps {
	className?: string
	data: Questions
	dataKey: number
	onChangeVariant: (value: Answer) => void
}

const SortableOption = ({ id, text }: { id: number; text: string }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id: `opt-${id}` })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: "grab",
		padding: "8px 12px",
		border: "1px solid #d9d9d9",
		borderRadius: "6px",
		background: "#fff",
		marginBottom: "8px",
		userSelect: "none" as const,
		zIndex: 100
	}

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			<HolderOutlined /> {text}
		</div>
	)
}

const DroppableBasket = ({
	selectedOptions,
	onRemove
}: {
	selectedOptions: Variant[]
	onRemove: (id: number) => void
}) => {
	const { setNodeRef, isOver } = useDroppable({ id: "basket" })

	const basketStyle = {
		minHeight: "100px",
		padding: "16px",
		border: `2px dashed ${isOver ? "#1677ff" : "#d9d9d9"}`,
		borderRadius: "8px",
		background: isOver ? "#e6f4ff" : "#fafafa",
		transition: "all 0.3s",
		marginBottom: "16px",
		display: "flex",
		flexWrap: "wrap" as const,
		gap: "8px",
		alignContent: "flex-start"
	}

	return (
		<div ref={setNodeRef} style={basketStyle}>
			{selectedOptions.length === 0 && (
				<div style={{ color: "#8c8c8c", margin: "auto" }}>
					Перетащите сюда правильные варианты
				</div>
			)}
			{selectedOptions.map((opt) => (
				<Tag
					key={opt.id}
					closable={true}
					onClose={() => onRemove(opt.id!)}
					style={{ padding: "4px 8px", fontSize: "14px" }}
				>
					{opt.text}
				</Tag>
			))}
		</div>
	)
}

const TestItem = forwardRef<HTMLDivElement, TextItemProps>(
	({ className, data: item, dataKey, onChangeVariant, ...props }, ref) => {
		const { mobile } = useResponsive()
		const {
			token: { colorWhite }
		} = useToken()

		// State for drag and drop
		const [draggedIds, setDraggedIds] = useState<number[]>([])

		const sensors = useSensors(
			useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
			useSensor(KeyboardSensor, {
				coordinateGetter: sortableKeyboardCoordinates
			})
		)

		const handleDragEnd = (event: DragEndEvent) => {
			const { active, over } = event
			if (over && over.id === "basket") {
				const optId = parseInt(String(active.id).replace("opt-", ""), 10)
				if (!draggedIds.includes(optId)) {
					// Check count limit
					if (item.count && draggedIds.length >= item.count) {
						return
					}
					const newIds = [...draggedIds, optId]
					setDraggedIds(newIds)
					onChangeVariant({
						question_id: item.id,
						option_id: newIds
					})
				}
			}
		}

		const removeDragged = (id: number) => {
			const newIds = draggedIds.filter((prevId) => prevId !== id)
			setDraggedIds(newIds)
			onChangeVariant({
				question_id: item.id,
				option_id: newIds.length > 0 ? newIds : undefined
			})
		}

		return (
			<Card
				className={cx(
					css`
						.ant-card-head-title {
							text-overflow: clip;
							white-space: normal;
							padding: 12px 0;
						}
					`,
					className
				)}
				title={
					<span>
						{dataKey}. {item.text}
					</span>
				}
				key={item.id}
				ref={ref}
				style={{
					width: "100%",
					backgroundColor: colorWhite
				}}
				styles={{
					body: { padding: mobile ? "8px 12px" : "16px 24px" }
				}}
				{...props}
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

				{item.type === "single" && (
					<Radio.Group
						onChange={({ target: { value } }: RadioChangeEvent) => {
							onChangeVariant({
								question_id: item.id,
								option_id: [value]
							})
						}}
						name={`test-${item.id}`}
						options={item.options.map((variant) => ({
							label: variant.text,
							value: variant.id
						}))}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8
						}}
						defaultValue={null}
					/>
				)}

				{item.type === "multiple" && (
					<Checkbox.Group<number>
						onChange={(values) => {
							onChangeVariant({
								question_id: item.id,
								option_id: values
							})
						}}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 8
						}}
					>
						{item.options.map((variant) => (
							<Checkbox key={variant.id} value={variant.id}>
								{variant.text}
							</Checkbox>
						))}
					</Checkbox.Group>
				)}

				{item.type === "drag" && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragEnd={handleDragEnd}
					>
						<Flex vertical={true} gap={12}>
							<DroppableBasket
								selectedOptions={item.options.filter((opt) =>
									draggedIds.includes(opt.id!)
								)}
								onRemove={removeDragged}
							/>
							<div style={{ padding: "0 4px" }}>
								<div
									style={{
										fontSize: "12px",
										color: "#8c8c8c",
										marginBottom: "8px"
									}}
								>
									Варианты (перетащите в поле выше):
									{item?.count ? ` (макс. ${item?.count})` : ""}
								</div>
								<SortableContext
									items={item.options
										.filter((opt) => !draggedIds.includes(opt.id!))
										.map((opt) => `opt-${opt.id}`)}
									strategy={verticalListSortingStrategy}
								>
									{item.options
										.filter((opt) => !draggedIds.includes(opt.id!))
										.map((variant) => (
											<SortableOption
												key={variant.id}
												id={variant.id!}
												text={variant.text}
											/>
										))}
								</SortableContext>
							</div>
						</Flex>
					</DndContext>
				)}
			</Card>
		)
	}
)
TestItem.displayName = "TestItem"

export { TestItem }
