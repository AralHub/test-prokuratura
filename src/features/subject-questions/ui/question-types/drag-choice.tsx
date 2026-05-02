import {
	HolderOutlined,
	MinusCircleOutlined,
	PlusOutlined
} from "@ant-design/icons"
import {
	Button,
	Card,
	Checkbox,
	Flex,
	Form,
	Input,
	Typography
} from "antd"
import { useState, useEffect } from "react"
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	useDroppable,
	defaultDropAnimationSideEffects
} from "@dnd-kit/core"
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { FormListFieldData } from "antd"
import type { Variant } from "src/entities/questions"

const DroppableContainer = ({ id, children }: { id: string, children: React.ReactNode }) => {
	const { setNodeRef, isOver } = useDroppable({ id })
	const style = {
		minHeight: 60,
		padding: 8,
		background: isOver ? "rgba(0,0,0,0.02)" : "transparent",
		border: "1px dashed #d9d9d9",
		borderRadius: 8,
		transition: "background 0.3s"
	}
	return (
		<div ref={setNodeRef} style={style}>
			{children}
		</div>
	)
}

interface SortableItemProps {
	field: FormListFieldData
	remove: (name: number | number[]) => void
	hideRemove?: boolean
}

const SortableItem = ({ field, remove, hideRemove }: SortableItemProps) => {
	const { key, ...restField } = field
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id: `field-${field.name}` })

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		marginBottom: 8,
		background: "white",
		position: "relative",
		zIndex: isDragging ? 1 : 0
	}

	return (
		<div key={key} ref={setNodeRef} style={style}>
			<Flex align="baseline" gap={8} style={{ marginBottom: 0 }}>
				<div style={{ cursor: "grab", height: "100%", padding: "4px" }} {...listeners} {...attributes}>
					<HolderOutlined />
				</div>
				<Form.Item
					{...restField}
					name={[field.name, "text"]}
					rules={[{ required: true }]}
					style={{ flex: 1, marginBottom: 0 }}
				>
					<Input.TextArea
						autoSize={{ minRows: 1 }}
						placeholder={`Вариант ${field.name + 1}`}
					/>
				</Form.Item>
				<Form.Item
					{...restField}
					name={[field.name, "is_correct"]}
					style={{ display: "none" }}
					valuePropName={"checked"}
					initialValue={false}
				>
					<Checkbox />
				</Form.Item>
				<Button
					type="text"
					danger={true}
					size="small"
					icon={<MinusCircleOutlined />}
					style={{ opacity: hideRemove ? 0 : 1, pointerEvents: hideRemove ? "none" : "auto" }}
					onClick={() => remove(field.name)}
				/>
			</Flex>
		</div>
	)
}

export const DragChoice = () => {
	const form = Form.useFormInstance()
	const options = Form.useWatch("options", form)
	
	// Локальный стейт для управления порядком в интерфейсе
	const [slots, setSlots] = useState<{ variantKey: string }[]>([])
	const [activeId, setActiveId] = useState<string | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	)

	const getFieldOptKey = (name: number) => {
		const id = form.getFieldValue(["options", name, "id"])
		return String(id !== undefined ? id : name)
	}

	// Инициализация слотов при загрузке данных
	useEffect(() => {
		const getOptKey = (name: number) => {
			const id = form.getFieldValue(["options", name, "id"])
			return String(id !== undefined ? id : name)
		}

		if (options) {
			const correctOnes = options
				.map((opt: Variant, index: number) => ({ ...opt, index }))
				.filter((opt: Variant) => opt.is_correct)
				.map((opt: Variant & { index: number }) => ({ variantKey: getOptKey(opt.index) }))
			
			// Обновляем стейт только если он пустой
			if (slots.length === 0 && correctOnes.length > 0) {
				setSlots(correctOnes)
			}
		}
	}, [options, form, slots.length])

	return (
		<Form.List name="options" initialValue={[{ is_correct: false }, { is_correct: false }]}>
			{(fields, { add, remove }) => {
				const correctItems: typeof fields = []
				slots.forEach((slot) => {
					const field = fields.find((f) => getFieldOptKey(f.name) === String(slot.variantKey))
					if (field) correctItems.push(field)
				})

				const incorrectItems = fields.filter(
					(f) => !correctItems.find((cf) => cf.name === f.name)
				)

				const onDragStart = (event: DragStartEvent) => {
					setActiveId(String(event.active.id))
				}

				const onDragEnd = (event: DragEndEvent) => {
					setActiveId(null)
					const { active, over } = event
					if (!over) return

					const activeIdStr = String(active.id)
					const activeName = parseInt(activeIdStr.replace("field-", ""), 10)
					const activeOptKey = getFieldOptKey(activeName)

					const isCurrentlyCorrect = slots.some((s) => String(s.variantKey) === activeOptKey)
					const overIdStr = String(over.id)
					
					let overContainer = ""
					let overOptKey: string | null = null

					if (overIdStr === "correct-slots") overContainer = "correct-slots"
					else if (overIdStr === "options-slots") overContainer = "options-slots"
					else {
						const overName = parseInt(overIdStr.replace("field-", ""), 10)
						overOptKey = getFieldOptKey(overName)
						overContainer = slots.some((s) => String(s.variantKey) === overOptKey)
							? "correct-slots"
							: "options-slots"
					}

					if (isCurrentlyCorrect && overContainer === "correct-slots") {
						if (overOptKey && activeOptKey !== overOptKey) {
							const oldIndex = slots.findIndex((s) => String(s.variantKey) === activeOptKey)
							const newIndex = slots.findIndex((s) => String(s.variantKey) === overOptKey)
							setSlots(arrayMove(slots, oldIndex, newIndex))
						}
					} else if (isCurrentlyCorrect && overContainer === "options-slots") {
						form.setFieldValue(["options", activeName, "is_correct"], false)
						setSlots(slots.filter((s) => String(s.variantKey) !== activeOptKey))
					} else if (!isCurrentlyCorrect && overContainer === "correct-slots") {
						form.setFieldValue(["options", activeName, "is_correct"], true)
						const newSlot = { variantKey: activeOptKey }
						if (overOptKey) {
							const overIndex = slots.findIndex((s) => String(s.variantKey) === overOptKey)
							const nextSlots = [...slots]
							nextSlots.splice(overIndex, 0, newSlot)
							setSlots(nextSlots)
						} else {
							setSlots([...slots, newSlot])
						}
					}
				}

				return (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
					>
						<div>
							<Card type={"inner"} style={{ marginBottom: 24 }}>
								<Typography.Paragraph style={{ marginBottom: 12 }}>
									Правильные ответы
								</Typography.Paragraph>
								<SortableContext
									id="correct-slots"
									items={correctItems.map((f) => `field-${f.name}`)}
									strategy={verticalListSortingStrategy}
								>
									<DroppableContainer id="correct-slots">
										{correctItems.length === 0 && (
											<div style={{ color: "#aaa", textAlign: "center", padding: "8px 0" }}>
												Перетащите правильные ответы сюда
											</div>
										)}
										{correctItems.map((f) => (
											<SortableItem key={`current-${f.key}`} field={f} remove={remove} hideRemove={fields.length <= 2} />
										))}
									</DroppableContainer>
								</SortableContext>
							</Card>

							<Typography.Paragraph style={{ marginBottom: 12 }}>
								Варианты ответов
							</Typography.Paragraph>
							<SortableContext
								id="options-slots"
								items={incorrectItems.map((f) => `field-${f.name}`)}
								strategy={verticalListSortingStrategy}
							>
								<DroppableContainer id="options-slots">
									{incorrectItems.map((f) => (
										<SortableItem key={`no-current-${f.key}`} field={f} remove={remove} hideRemove={fields.length <= 2} />
									))}
								</DroppableContainer>
							</SortableContext>

							<Form.Item className="mt-8">
								<Button onClick={() => add({ is_correct: false })} block={true} icon={<PlusOutlined />}>
									Добавить вариант
								</Button>
							</Form.Item>
						</div>
						<DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
							{activeId ? (
								<Card size="small" style={{ opacity: 0.8, background: "#fafafa", cursor: "grabbing" }}>
									<Flex align="baseline" gap={8} style={{ marginBottom: 0 }}>
										<HolderOutlined />
										<span>Перемещение варианта...</span>
									</Flex>
								</Card>
							) : null}
						</DragOverlay>
					</DndContext>
				)
			}}
		</Form.List>
	)
}
