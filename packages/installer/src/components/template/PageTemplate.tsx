import React from 'react';
import {useWindowDimensions} from 'react-native';
import { styled } from '@kaidu/shared/lib/styles';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import View from '../atomic/View';

const PageContainer = props => {
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();

  //Theme switch
  const isDarkMode = useColorScheme() === 'dark';
  const safeAreaStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    height: windowHeight
  };

  const {children} = props;

  const styles = StyleSheet.create({
    outerWrapper: {
      width: windowWidth,
      flex: 12,
      justifyContent: 'flex-start',
    },
  });

  return (
    <SafeAreaView style={safeAreaStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View {...props} style={styles.outerWrapper} isDarkMode={isDarkMode}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const Content = props => {
  const ContentContainer = styled(View)`
    flex: 10;
    max-width: 100%;
    max-height: 100%;
    /* border: 1px solid white; */
  `;

  return (
    <ContentContainer
      {...props}
    />
  );
};

const Footer = styled(View)`
  margin-top: auto;
  width: 100%;
  flex-shrink: 1;
  flex-grow: 0;
`;

const Header = styled(View)`
  width: 100%;
  flex-shrink: 1;
  flex-grow: 0;
  margin-bottom: 0;
`;

export default function PageTemplate(props) {
  const {header, footer, children, ...rest} = props;

  return (
    <PageContainer {...rest}>
      {header ? <Header>{header}</Header> : null}
      <Content>
        {children}
      </Content>
      {footer ? <Footer>{footer}</Footer> : null}
    </PageContainer>
  );
}
