import { Static, Type } from '@sinclair/typebox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR, { useSWRConfig } from 'swr'
import { PageBody, PageForm, PageFormSubmitHandler, PageHeader } from '../../../../framework'
import { TypeTextInput } from '../../../../framework/PageForm/PageFormSchema'
import { requestGet, requestPatch, requestPost, swrOptions } from '../../../Data'
import { RouteE } from '../../../Routes'
import { Organization } from '../../interfaces/Organization'
import { getControllerError } from '../../useControllerView'

export function EditOrganization() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const params = useParams<{ id?: string }>()
  const id = Number(params.id)

  const { data: organization } = useSWR<Organization>(
    Number.isInteger(id) ? `/api/v2/organizations/${id.toString()}/` : undefined,
    requestGet,
    swrOptions
  )

  const EditOrganizationSchema = useMemo(
    () =>
      Type.Object({
        name: TypeTextInput({ title: t('Name') }),
        description: Type.Optional(Type.String({ title: t('Description'), variant: 'textarea' })),
        instanceGroups: Type.Optional(
          Type.String({ title: t('Instance groups'), variant: 'select' })
        ),
        executionEnvironments: Type.Optional(
          Type.String({ title: t('Execution environment'), variant: 'select' })
        ),
        galaxyCredentials: Type.Optional(
          Type.String({ title: t('Galaxy credentials'), variant: 'select' })
        ),
      }),
    [t]
  )

  type CreateOrganization = Static<typeof EditOrganizationSchema>

  const { cache } = useSWRConfig()

  const onSubmit: PageFormSubmitHandler<CreateOrganization> = async (
    editedOrganization,
    setError
  ) => {
    try {
      let organization: Organization
      if (Number.isInteger(id)) {
        organization = await requestPatch<Organization>(
          `/api/v2/organizations/${id}/`,
          editedOrganization
        )
      } else {
        organization = await requestPost<Organization>('/api/v2/organizations/', editedOrganization)
      }
      ;(cache as unknown as { clear: () => void }).clear?.()
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString()))
    } catch (err) {
      setError(await getControllerError(err))
    }
  }
  const onCancel = () => navigate(-1)

  if (Number.isInteger(id)) {
    if (!organization) {
      return (
        <>
          <PageHeader
            breadcrumbs={[
              { label: t('Organizations'), to: RouteE.Organizations },
              { label: t('Edit organization') },
            ]}
          />
        </>
      )
    } else {
      return (
        <>
          <PageHeader
            title={t('Edit organization')}
            breadcrumbs={[
              { label: t('Organizations'), to: RouteE.Organizations },
              { label: t('Edit organization') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={EditOrganizationSchema}
              submitText={t('Save organization')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={organization}
            />
          </PageBody>
        </>
      )
    }
  } else {
    return (
      <>
        <PageHeader
          title={t('Create organization')}
          breadcrumbs={[
            { label: t('Organizations'), to: RouteE.Organizations },
            { label: t('Create organization') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={EditOrganizationSchema}
            submitText={t('Create organization')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          />
        </PageBody>
      </>
    )
  }
}
