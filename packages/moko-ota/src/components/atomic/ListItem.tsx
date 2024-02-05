import React from 'react';
import {ListItem} from 'react-native-elements'; //https://reactnativeelements.com/docs/listitem
import { styled } from '@kaidu/shared/lib/styles';
import {lighten} from 'polished';
import Icon from '~/components/atomic/Icon';

const StyledListItem = styled(ListItem).attrs(props => ({
  containerStyle: {backgroundColor: props.theme.colors.primary},
  disabledStyle: {color: lighten(0.6, props.theme.colors.tertiary)},
}))``;

const StyledContent = styled(ListItem.Content)`
  background-color: transparent;
`;

const StyledListTitle = styled(ListItem.Title)`
  color: ${props => props.theme.colors.tertiary};
`;

const StyledListSubtitle = styled(ListItem.Subtitle)`
  color: ${props => props.theme.colors.fourth};
`;

export default function MyListItem({...optionals}) {
  const {
    disabled = false,
    title,
    subtitle,
    children,
    isSelected = false,
    titleStyle,
    subtitleStyle,
    ...rest
  } = optionals;
  return (
    <StyledListItem {...rest} disabled={disabled}>
      {isSelected ? <Icon name="check" /> : null}
      <StyledContent>
        {title ? (
          <StyledListTitle style={titleStyle}>{title}</StyledListTitle>
        ) : null}
        {subtitle ? (
          <StyledListSubtitle style={subtitleStyle}>
            {subtitle}
          </StyledListSubtitle>
        ) : null}
        {children}
      </StyledContent>
    </StyledListItem>
  );
}
