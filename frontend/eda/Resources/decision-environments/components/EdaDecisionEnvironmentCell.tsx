import useSWR from 'swr';
import { TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { useFetcher } from '../../../../common/crud/Data';
import { EdaProject } from '../../../interfaces/EdaProject';

export function EdaDecisionEnvironmentCell(props: { id?: number }) {
  const fetcher = useFetcher();
  const { data } = useSWR<EdaProject>(
    props.id ? `/api/eda/v1/decision-environments/${props.id}/` : undefined,
    fetcher,
    {
      dedupingInterval: 10 * 1000,
    }
  );
  if (!data) {
    switch (typeof props.id) {
      case 'number':
      case 'string':
        return <>{props.id}</>;
    }
    return <></>;
  }
  return (
    <TextCell
      text={data.name}
      to={
        props.id
          ? RouteObj.EdaDecisionEnvironmentDetails.replace(':id', props.id.toString())
          : undefined
      }
    />
  );
}
