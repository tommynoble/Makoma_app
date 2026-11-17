import { Redirect } from 'expo-router';

// TODO: route to /(tabs)/discover when a session with a completed profile exists.
export default function Index() {
  return <Redirect href="/welcome" />;
}
