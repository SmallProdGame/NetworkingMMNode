interface Event {
    type: string;
    func: (data: any) => void;
}
export default class EventHandler {
    events: Event[];
    on: (type: string, func: (data: any) => void) => void;
    emit: (type: string, data: any) => void;
}
export {};
