interface Event {
  type: string;
  func: (data: any) => void;
}
export default class EventHandler {
  events: Event[] = [];
  on = (type: string, func: (data: any) => void) => {
    const event = this.events.find((e) => e.type === type);
    if (event) {
      event.func = func;
    } else {
      this.events.push({ type, func });
    }
  };

  emit = (type: string, data: any) => {
    const ev = this.events.find((e) => e.type === type);
    if (ev) {
      ev.func(data);
    }
  };

  clearEvents = () => {
    this.events = [];
  };
}
