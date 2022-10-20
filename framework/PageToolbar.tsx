import {
    Button,
    Flex,
    FlexItem,
    InputGroup,
    OnPerPageSelect,
    OnSetPage,
    Pagination,
    PaginationVariant,
    Select,
    SelectOption,
    SelectOptionObject,
    SelectVariant,
    Skeleton,
    TextInputGroup,
    TextInputGroupMain,
    TextInputGroupUtilities,
    Toolbar,
    ToolbarContent,
    ToolbarFilter,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,
    Tooltip,
} from '@patternfly/react-core'
import { ArrowRightIcon, ColumnsIcon, FilterIcon, TimesIcon } from '@patternfly/react-icons'
import { Dispatch, Fragment, SetStateAction, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkSelector } from './components/BulkSelector'
import { SingleSelect2 } from './components/SingleSelect'
import { useBreakpoint } from './components/useBreakPoint'
import { useSettings } from './Settings'
import { ITypedAction, TypedActions, TypedActionType } from './TypedActions'

export interface IItemFilter<T extends object> {
    label: string
    type?: 'search' | 'filter'
    options: {
        label: string
        value: string
    }[]
    filter: (item: T, values: string[]) => boolean
}

export type SetFilterValues<T extends object> = (filter: IItemFilter<T>, values: string[]) => void

export function toolbarActionsHaveBulkActions<T extends object>(actions?: ITypedAction<T>[]) {
    if (!actions) return false
    for (const action of actions) {
        if (action.type === 'bulk') return true
    }
    return false
}

export interface IToolbarStringFilter {
    key: string
    label: string
    type: 'string'
    query: string
    placeholder?: string
}

export interface IToolbarSelectFilter {
    key: string
    label: string
    type: 'select'
    options: {
        label: string
        value: string
    }[]
    query: string
    placeholder?: string
}

export type IToolbarFilter = IToolbarStringFilter | IToolbarSelectFilter

export type IFilterState = Record<string, string[] | undefined>

export type PagetableToolbarProps<T extends object> = {
    openColumnModal?: () => void
    keyFn: (item: T) => string | number

    itemCount?: number

    toolbarActions?: ITypedAction<T>[]

    toolbarFilters?: IToolbarFilter[]
    filters?: Record<string, string[]>
    setFilters?: Dispatch<SetStateAction<Record<string, string[]>>>
    clearAllFilters?: () => void

    page: number
    perPage: number
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void

    isSelected?: (item: T) => boolean
    selectedItems?: T[]
    selectItem?: (item: T) => void
    unselectItem?: (item: T) => void
    selectItems?: (items: T[]) => void
    unselectAll?: () => void
    onSelect?: (item: T) => void
    disableBorderBottom?: boolean

    showSelect?: boolean
}

export function PageTableToolbar<T extends object>(props: PagetableToolbarProps<T>) {
    const {
        itemCount,
        page,
        perPage,
        setPage,
        setPerPage,
        toolbarFilters,
        selectedItems,
        filters,
        setFilters,
        clearAllFilters,
        openColumnModal,
        disableBorderBottom,
    } = props

    const sm = useBreakpoint('md')

    let { toolbarActions } = props
    toolbarActions = toolbarActions ?? []

    const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage])
    const onPerPageSelect = useCallback<OnPerPageSelect>((_event, perPage) => setPerPage(perPage), [setPerPage])

    const showSearchAndFilters = toolbarFilters !== undefined
    const showToolbarActions = toolbarActions !== undefined && toolbarActions.length > 0

    const showSelect =
        props.showSelect === true ||
        (selectedItems !== undefined &&
            toolbarActions &&
            toolbarActions.find((toolbarAction) => TypedActionType.bulk === toolbarAction.type))

    const showToolbar = showSelect || showSearchAndFilters || showToolbarActions

    const [selectedFilter, setSeletedFilter] = useState(() =>
        toolbarFilters ? (toolbarFilters?.length > 0 ? toolbarFilters[0].key : '') : ''
    )

    const settings = useSettings()

    if (!showToolbar) {
        return <Fragment />
    }

    if (itemCount === undefined) {
        return (
            <Toolbar
                style={{
                    borderBottom: disableBorderBottom ? undefined : 'thin solid var(--pf-global--BorderColor--100)',
                    paddingBottom: sm ? undefined : 8,
                    paddingTop: sm ? undefined : 8,
                    backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
                }}
            >
                <ToolbarContent>
                    <ToolbarItem style={{ width: '100%' }}>
                        <Skeleton height="36px" />
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
        )
    }

    return (
        <Toolbar
            clearAllFilters={clearAllFilters}
            style={{
                borderBottom: disableBorderBottom ? undefined : 'thin solid var(--pf-global--BorderColor--100)',
                paddingBottom: sm ? undefined : 8,
                paddingTop: sm ? undefined : 8,
                backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
            }}
        >
            <ToolbarContent>
                {showSelect && (
                    <ToolbarGroup>
                        <ToolbarItem variant="bulk-select">
                            <BulkSelector {...props} />
                        </ToolbarItem>
                    </ToolbarGroup>
                )}
                {toolbarFilters && toolbarFilters.length > 0 && (
                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="md" style={{ zIndex: 302 }}>
                        <ToolbarGroup variant="filter-group">
                            <ToolbarItem>
                                <SingleSelect2 onChange={setSeletedFilter} value={selectedFilter}>
                                    {toolbarFilters.map((filter) => (
                                        <SelectOption key={filter.key} value={filter.key}>
                                            <Flex
                                                spaceItems={{ default: 'spaceItemsNone' }}
                                                alignItems={{ default: 'alignItemsCenter' }}
                                                flexWrap={{ default: 'nowrap' }}
                                            >
                                                <FlexItem style={{ paddingLeft: 4, paddingRight: 8 }}>
                                                    <FilterIcon />
                                                </FlexItem>
                                                <FlexItem>{filter.label}</FlexItem>
                                            </Flex>
                                        </SelectOption>
                                    ))}
                                </SingleSelect2>
                            </ToolbarItem>
                            <ToolbarItem>
                                <ToolbarFilterInput
                                    filter={toolbarFilters.find((filter) => filter.key === selectedFilter)}
                                    addFilter={(value: string) => {
                                        let values = filters?.[selectedFilter]
                                        if (!values) values = []
                                        if (!values.includes(value)) values.push(value)
                                        setFilters?.({ ...filters, [selectedFilter]: values })
                                    }}
                                    removeFilter={(value: string) => {
                                        let values = filters?.[selectedFilter]
                                        if (!values) values = []
                                        values = values.filter((v) => v !== value)
                                        setFilters?.({ ...filters, [selectedFilter]: values })
                                    }}
                                    values={filters?.[selectedFilter] ?? []}
                                />
                            </ToolbarItem>
                            {toolbarFilters.map((filter) => {
                                const values = filters?.[filter.key] ?? []
                                return (
                                    <ToolbarFilter
                                        key={filter.label}
                                        categoryName={filter.label}
                                        chips={values.map((value) => {
                                            return 'options' in filter
                                                ? filter.options.find((o) => o.value === value)?.label ?? value
                                                : value
                                        })}
                                        deleteChip={(_group, value) => {
                                            setFilters?.((filters) => {
                                                //TODO bug here where value is actually select filter option label... need to map
                                                const newState = { ...filters }
                                                value = typeof value === 'string' ? value : value.key
                                                let values = filters[filter.key]
                                                if (values) {
                                                    values = values.filter((v) => v !== value)
                                                    if (values.length === 0) {
                                                        delete newState[filter.key]
                                                    } else {
                                                        newState[filter.key] = values
                                                    }
                                                }
                                                return newState
                                            })
                                        }}
                                        deleteChipGroup={() => {
                                            setFilters?.((filters) => {
                                                const newState = { ...filters }
                                                delete newState[filter.key]
                                                return newState
                                            })
                                        }}
                                        showToolbarItem={false}
                                    >
                                        <></>
                                    </ToolbarFilter>
                                )
                            })}
                        </ToolbarGroup>
                    </ToolbarToggleGroup>
                )}

                {/* Action Buttons */}
                <ToolbarGroup variant="button-group" style={{ zIndex: 302 }}>
                    <TypedActions actions={toolbarActions} selectedItems={selectedItems} wrapper={ToolbarItem} />
                    {openColumnModal && (
                        <ToolbarItem>
                            <Tooltip content={'Manage columns'}>
                                <Button variant="plain" icon={<ColumnsIcon />} onClick={openColumnModal} />
                            </Tooltip>
                        </ToolbarItem>
                    )}
                </ToolbarGroup>

                {/* {toolbarButtonActions.length > 0 && <ToolbarGroup variant="button-group">{toolbarActionButtons}</ToolbarGroup>} */}
                {/* <ToolbarGroup variant="button-group">{toolbarActionDropDownItems}</ToolbarGroup> */}

                {/* Pagination */}
                <ToolbarItem variant="pagination" visibility={{ default: 'hidden', '2xl': 'visible' }}>
                    <Pagination
                        variant={PaginationVariant.top}
                        isCompact
                        itemCount={itemCount}
                        perPage={perPage}
                        page={page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        style={{ marginTop: -8, marginBottom: -8 }}
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    )
}

function ToolbarFilterInput(props: {
    filter?: IToolbarFilter
    addFilter: (value: string) => void
    values: string[]
    removeFilter: (value: string) => void
}) {
    const { filter } = props
    switch (filter?.type) {
        case 'string':
            return <ToolbarTextFilter {...props} placeholder={filter.placeholder} />
        case 'select':
            return <ToolbarSelectFilter {...props} options={filter.options} placeholder={filter.placeholder} />
    }
    return <></>
}

function ToolbarTextFilter(props: { addFilter: (value: string) => void; placeholder?: string }) {
    const [value, setValue] = useState('')
    return (
        <InputGroup>
            <TextInputGroup style={{ minWidth: 220 }}>
                <TextInputGroupMain
                    // ref={ref}
                    value={value}
                    onChange={setValue}
                    onKeyUp={(event) => {
                        if (value && event.key === 'Enter') {
                            props.addFilter(value)
                            setValue('')
                            // ref.current?.focus() // Does not work because PF does not expose ref
                        }
                    }}
                    placeholder={props.placeholder}
                />
                {value !== '' && (
                    <TextInputGroupUtilities>
                        <Button
                            variant="plain"
                            aria-label="add filter"
                            onClick={() => setValue('')}
                            style={{ opacity: value ? undefined : 0 }}
                            // tabIndex={value ? undefined : -1}
                            tabIndex={-1}
                        >
                            <TimesIcon />
                        </Button>
                    </TextInputGroupUtilities>
                )}
            </TextInputGroup>

            {!value ? (
                <></>
            ) : (
                // <Button variant={'control'} aria-label="add filter">
                //     <SearchIcon />
                // </Button>
                <Button
                    variant={value ? 'primary' : 'control'}
                    aria-label="add filter"
                    onClick={() => {
                        props.addFilter(value)
                        setValue('')
                    }}
                >
                    <ArrowRightIcon />
                </Button>
            )}
        </InputGroup>
    )
}

function ToolbarSelectFilter(props: {
    addFilter: (value: string) => void
    removeFilter: (value: string) => void
    options: { label: string; value: string }[]
    values: string[]
    placeholder?: string
}) {
    const { t } = useTranslation()
    const { addFilter, removeFilter, options, values } = props
    const [open, setOpen] = useState(false)
    const onSelect = useCallback(
        (e: unknown, value: string | SelectOptionObject) => {
            if (values.includes(value.toString())) {
                removeFilter(value.toString())
            } else {
                addFilter(value.toString())
            }
        },
        [addFilter, removeFilter, values]
    )
    const selections = values
    return (
        <>
            <Select
                variant={SelectVariant.checkbox}
                isOpen={open}
                onToggle={setOpen}
                selections={selections}
                onSelect={onSelect}
                placeholderText={values.length ? t('Selected') : <span style={{ opacity: 0.7 }}>{props.placeholder}</span>}
            >
                {options.map((option) => (
                    <SelectOption id={option.value} key={option.value} value={option.value}>
                        {option.label}
                    </SelectOption>
                ))}
            </Select>
        </>
    )
}