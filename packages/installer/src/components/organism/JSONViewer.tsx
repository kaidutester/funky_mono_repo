import React from 'react';
import { styled } from '@kaidu/shared/lib/styles';
import {Divider} from 'react-native-elements';
import Text from '../atomic/Text';
import View from '../atomic/View';
import _ from 'lodash';
import ScrollView from '../atomic/ScrollView';
import PageTemplate from '../template/PageTemplate';

const Row = styled(View)`
  padding: 8px 16px;
  justify-content: center;
  text-align: center;
`;

export default function JSONViewer(props) {
  // A component for displaying non-editable JSON data
  const {json} = props;
  console.debug(`JSONViewer mounted`);

  return (
    <PageTemplate>
      <ScrollView>
        {_.isObject(json) ? (
          Object.keys(json).map((key, i) => (
            <Row key={key}>
              <Text>{convertKeyToDisplayVersion(key)}:</Text>
              <Text>{json[key] ?? 'No value'}</Text>
              <Divider />
            </Row>
          ))
        ) : (
          <Text>{'Not a valid JSON object'}</Text>
        )}
      </ScrollView>
    </PageTemplate>
  );
}

function convertKeyToDisplayVersion(key: string):string {
  try {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (err) {
    console.error(`convertKeyToDisplayVersion failed`);
    throw new Error(`${err?.message}`);
  }
}