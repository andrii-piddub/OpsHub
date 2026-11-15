import { useState } from "react"
import type { WorkItemPriority } from "../api/workitems"
import { postWorkItems } from '../api/workitems'
import { ApiErrors } from '../api/ApiError.ts'
import type { FormEvent } from 'react'
import { useNavigate } from "react-router";
export function useWorkItem(handleErrors: (error: unknown,
    signal?: AbortSignal) => Promise<void>) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<WorkItemPriority>('ME')
    const priorities: { value: WorkItemPriority; label: string }[] = [
        { value: 'LO', label: 'Low' },
        { value: 'ME', label: 'Medium' },
        { value: 'HI', label: 'High' },
    ]
    const [dueDate, setDueDate] = useState<string | null>(null)
    const [creatingItem, setCreatingItem] = useState(false)
    const [createError, setCreateError] = useState('')
    const navigate = useNavigate();
    async function createWorkItem(title: string, description: string, priority: WorkItemPriority, dueDate: string | null) {
        setCreatingItem(true);
        setCreateError('')
        try {
            await postWorkItems(title, description, priority, dueDate)
            setPriority('ME')
            setDueDate(null)
            return true
        } catch (error) {
            console.log(error)
            await handleErrors(error)
            setCreateError(
                error instanceof ApiErrors
                    ? error.message
                    : 'Failed to create WorkItem',
            )
        } finally {
            setCreatingItem(false)


        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const success = await createWorkItem(title, description, priority, dueDate)
        if (success === true) {
            setTitle('');
            setDescription('');

            navigate('/workitem')

        }

    }
    return { handleSubmit, priority, setPriority, priorities, creatingItem, title, description, setTitle, setDescription, dueDate, setDueDate, createError }

}