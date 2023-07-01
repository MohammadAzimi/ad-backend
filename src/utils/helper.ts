export function handleIPV6(ip: string) {
  if (ip.slice(0, 7) == '::ffff:') {
    return ip.slice(7, ip.length);
  }

  return ip;
}
