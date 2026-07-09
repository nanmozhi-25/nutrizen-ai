import { useCountUp } from "../utils/useCountUp";

export default function AnimatedNumber({ value, suffix = "" }) {
  const animated = useCountUp(value);
  return <>{animated}{suffix}</>;
}
