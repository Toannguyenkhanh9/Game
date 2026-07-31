import React from 'react';
import type { PropsWithChildren } from 'react';
import { StatusBar,useColorScheme } from 'react-native';
import AppView from './source/AppView';
type SectionProps = PropsWithChildren<{title: string;}>;
function App(): JSX.Element {
  return (
    <>
      <StatusBar hidden />
      <AppView />
    </>
  );
}
export default App;