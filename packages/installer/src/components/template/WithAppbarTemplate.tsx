import React from 'react';
import PageTemplate from './PageTemplate';
import {DISPLAY_NAME, VERSION} from '~/lib/constants';
import Appbar from '../molecule/Appbar';

export default function WithAppbarTemplate(props) {
  return (
    <PageTemplate header={<Appbar title={DISPLAY_NAME} version={VERSION} />}>
      {props.children}
    </PageTemplate>
  );
}
