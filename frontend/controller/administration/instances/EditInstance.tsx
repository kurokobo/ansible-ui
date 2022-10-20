import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import { PageBody, PageHeader, PageLayout } from '../../../../framework'
import { FormPageSubmitHandler, PageForm } from '../../../../framework/PageForm'
import { requestGet, requestPatch, swrOptions } from '../../../Data'
import { RouteE } from '../../../Routes'
import { getControllerError } from '../../useControllerView'
import { Instance } from './Instance'

export function EditInstance() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const params = useParams<{ id?: string }>()
    const id = Number(params.id)

    const { data: instance } = useSWR<Instance>(`/api/v2/instances/${id.toString()}/`, requestGet, swrOptions)

    const EditInstanceSchema = useMemo(
        () =>
            Type.Object({
                capacity_adjustment: Type.Number({
                    title: t('Capacity'),
                    max: 99,
                    min: instance?.cpu_capacity ?? 1,
                    valueLabel: 'forks',
                }),
                enabled: Type.Boolean({
                    title: t('Enabled'),
                }),
            }),
        [instance?.cpu_capacity, t]
    )

    type CreateInstance = Static<typeof EditInstanceSchema>

    const { cache } = useSWRConfig()

    const onSubmit: FormPageSubmitHandler<CreateInstance> = async (editedInstance, setError) => {
        try {
            editedInstance.capacity_adjustment = Math.round(editedInstance.capacity_adjustment * 100) / 100
            const instance: Instance = await requestPatch<Instance>(`/api/v2/instances/${id}/`, editedInstance)
            ;(cache as unknown as { clear: () => void }).clear?.()
            navigate(RouteE.InstanceDetails.replace(':id', instance.id.toString()))
        } catch (err) {
            setError(await getControllerError(err))
        }
    }
    const onCancel = () => navigate(-1)

    if (!instance) {
        return (
            <PageLayout>
                <PageHeader breadcrumbs={[{ label: t('Instances'), to: RouteE.Instances }, { label: t('Edit instance') }]} />
            </PageLayout>
        )
    } else {
        return (
            <PageLayout>
                <PageHeader
                    title={instance.hostname}
                    breadcrumbs={[{ label: t('Instances'), to: RouteE.Instances }, { label: instance.hostname }]}
                />
                <PageBody>
                    <PageForm
                        schema={EditInstanceSchema}
                        submitText={t('Save instance')}
                        onSubmit={onSubmit}
                        cancelText={t('Cancel')}
                        onCancel={onCancel}
                        defaultValue={{ capacity_adjustment: Number(instance.capacity_adjustment), enabled: instance.enabled }}
                    />
                </PageBody>
            </PageLayout>
        )
    }
}