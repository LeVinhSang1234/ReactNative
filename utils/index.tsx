export function unMount(paramThis: any) {
  paramThis.setState = () => null;
}
