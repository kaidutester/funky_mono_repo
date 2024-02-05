import React from 'react';
import JSONViewer from '../../components/organism/JSONViewer';
import PageTemplate from '../../components/template/PageTemplate';
import { Text } from '@kaidu/shared/components/atomic/Text';

export default function JSONScreen(props) {
  // A screen for displaying simple JSON data
  const {route} = props;
  const { data } = route?.params || {};
  console.debug(`JSONScreen mounted`);

  if (!data) {
    return (
      <PageTemplate>
        <Text>No data to display</Text>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <JSONViewer json={data} />
    </PageTemplate>
  );
}
