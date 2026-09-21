export function formatRupees(amount) {
  if (amount == null) return '';
  return `\u20B9 ${Number(amount).toLocaleString('en-IN')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateLine1(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

export function formatDateLine2(dateStr) {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}
