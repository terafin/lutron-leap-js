export declare class UnimplementedMessageBodyType {
    type: string;
    constructor(type: string);
}
export declare type MessageBodyType = 'OneProjectDefinition' | 'OnePresetDefinition' | 'OneAreaSceneDefinition' | 'OneLinkDefinition' | 'OneLinkNodeDefinition' | 'MultipleLinkNodeDefinition' | 'MultipleLinkDefinition' | 'OneControlStationDefinition' | 'OneAreaDefinition' | 'MultipleAreaDefinition' | 'OneAreaStatus' | 'MultipleAreaStatus' | 'OneDeviceStatus' | 'OneDeviceDefinition' | 'MultipleDeviceDefinition' | 'OneZoneDefinition' | 'OneZoneStatus' | 'MultipleZoneStatus' | 'OnePingResponse' | 'OneButtonGroupDefinition' | 'OneButtonDefinition' | 'OneButtonStatusEvent' | 'ExceptionDetail';
export declare class OneDeviceStatus {
    DeviceStatus: DeviceStatus;
}
export declare class OneAreaSceneDefinition {
    AreaSceneDefinition: AreaSceneDefinition;
}
export declare class OnePresetDefinition {
    PresetDefinition: PresetDefinition;
}
export declare class OneLinkDefinition {
    LinkNodeDefinition: LinkNodeDefinition;
}
export declare class OneLinkNodeDefinition {
    LinkNodeDefinition: LinkNodeDefinition;
}
export declare class MultipleLinkNodeDefinition {
    Links: LinkNodeDefinition[];
}
export declare class MultipleLinkDefinition {
    Links: LinkNodeDefinition[];
}
export declare class OneDeviceDefinition {
    Device: Device;
}
export declare class MultipleDeviceDefinition {
    Devices: Device[];
}
export declare class MultipleAreaDefinition {
    Areas: AreaDefinition[];
}
export declare class OneZoneDefinition {
    ZoneDefinition: ZoneDefinition;
}
export declare class OneProjectDefinition {
    ProjectDefinition: ProjectDefinition;
}
export declare class OneAreaStatus {
    AreaStatus: AreaStatus;
}
export declare class MultipleAreaStatus {
    AreaStatuses: AreaStatus[];
}
export declare class OneAreaDefinition {
    AreaDefinition: AreaDefinition;
}
export declare class OneControlStationDefinition {
    ControlStationDefinition: ControlStationDefinition;
}
export declare class OneZoneStatus {
    ZoneStatus: ZoneStatus;
}
export declare class MultipleZoneStatus {
    ZonsStatuses: ZoneStatus[];
}
export declare class OnePingResponse {
    PingResponse: {
        LEAPVersion: number;
    };
}
export declare class OneButtonGroupDefinition {
    ButtonGroup: ButtonGroup;
}
export declare class OneButtonDefinition {
    Button: Button;
}
export declare class OneButtonStatusEvent {
    ButtonStatus: ButtonStatus;
}
export declare class ExceptionDetail {
    Message: string;
}
export declare type BodyType = OneProjectDefinition | OnePresetDefinition | OneAreaSceneDefinition | OneLinkDefinition | OneLinkNodeDefinition | MultipleLinkNodeDefinition | MultipleLinkDefinition | OneZoneDefinition | OneAreaDefinition | MultipleAreaDefinition | OneControlStationDefinition | OneAreaStatus | MultipleAreaStatus | OneDeviceStatus | OneDeviceDefinition | MultipleDeviceDefinition | OneZoneStatus | MultipleZoneStatus | OnePingResponse | OneButtonGroupDefinition | OneButtonDefinition | OneButtonStatusEvent | ExceptionDetail;
export declare function parseBody(type: MessageBodyType, data: object): BodyType;
export declare type Href = {
    href: string;
};
declare type PhaseSetting = Href & {
    Direction: string;
};
declare type TuningSetting = Href & {
    HighEndTrim: number;
    LowEndTrim: number;
};
export declare type Zone = Href & {
    AssociatedArea: Href;
    ControlType: string;
    Name: string;
    PhaseSettings: PhaseSetting;
    SortOrder: number;
    TuningSettings: TuningSetting;
};
export declare type AffectedZone = Href & {
    ButtonGroup: ButtonGroup;
    Zone: Zone;
};
declare type AdvancedToggleProperties = {
    PrimaryPreset: Href;
    SecondaryPreset: Href;
};
declare type DualActionProperties = {
    PressPreset: Href;
    ReleasePreset: Href;
};
declare type ProgrammingModel = Href & {
    AdvancedToggleProperties: AdvancedToggleProperties;
    DualActionProperties: DualActionProperties;
    Name: string;
    Parent: Href;
    Preset: Href;
    ProgrammingModelType: string;
};
export declare type Button = Href & {
    AssociatedLED: Href;
    ButtonNumber: number;
    Engraving: {
        Text: string;
    };
    Name: string;
    Parent: Href;
    ProgrammingModel: ProgrammingModel;
};
export declare type ButtonGroup = Href & {
    AffectedZones: AffectedZone[];
    Buttons: Button[];
    Parent: Device;
    ProgrammingType: string;
    SortOrder: number;
    StopIfMoving: string;
};
export declare type ButtonStatus = Href & {
    Button: Href;
    ButtonEvent: {
        EventType: 'Press' | 'Release' | 'LongHold';
    };
};
export declare type Device = Href & {
    Name: string;
    FullyQualifiedName: string[];
    Parent: Href;
    SerialNumber: string;
    ModelNumber: string;
    DeviceType: string;
    ButtonGroups: Href[];
    LocalZones: Href[];
    AssociatedArea: Href;
    OccupancySensors: Href[];
    LinkNodes: Href[];
    DeviceRules: Href[];
    RepeaterProperties: {
        IsRepeater: boolean;
    };
    FirmwareImage: {
        Firmware: {
            DisplayName: string;
        };
        Installed: {
            Year: number;
            Month: number;
            Day: number;
            Hour: number;
            Minute: number;
            Second: number;
            Utc: string;
        };
    };
};
declare type FanSpeedType = 'High' | 'MediumHigh' | 'Medium' | 'Low' | 'Off';
declare type ZoneStatus = Href & {
    CCOLevel: 'Open' | 'Closed';
    Level: number;
    SwitchedLevel: 'On' | 'Off';
    FanSpeed: FanSpeedType;
    Zone: Href;
    StatusAccuracy: 'Good';
    AssociatedArea: Href;
    Availability: 'Available' | 'Unavailable' | 'Mixed' | 'Unknown';
    Tilt: number;
};
declare type ZoneDefinition = Href & {
    Name: string;
    ControlType: string;
    Category: {
        Type: string;
        IsLight: boolean;
    };
    Device: Href;
    AssociatedFacade: Href;
};
export declare type DeviceStatus = Href & {
    DeviceHeard: DeviceHeard;
};
export declare type DeviceHeard = {
    DiscoveryMechanism: 'UserInteraction' | 'UnassociatedDeviceDiscovery' | 'Unknown';
    SerialNumber: string;
    DeviceType: string;
    ModelNumber: string;
};
declare type AreaStatus = Href & {
    Level: number;
    OccupancyStatus: string;
    CurrentScene: Href;
};
declare type AreaDefinition = Href & {
    Name: string;
    ControlType: string;
    Parent: Href;
    AssociatedZones: Href[];
    AssociatedControlStations: Href[];
};
declare type ControlStationDefinition = Href & {
    Name: string;
    ControlType: string;
    Parent: Href;
    AssociatedArea: Href;
    SortOrder: number;
    AssociatedGangedDevices: Device[];
};
declare type ProjectDefinition = Href & {
    Name: string;
    ControlType: string;
    ProductType: string;
    Contacts: Href[];
    TimeclockEventRules: Href;
    ProjectModifiedTimestamp: {
        Year: number;
        Month: number;
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        Utc: 'string';
    };
};
declare type LinkNodeDefinition = Href & {
    Parent: Href;
    LinkType: string;
    SortOrder: number;
    AssociatedLink: Href;
    ClearConnectTypeXLinkProperties: {
        PANID: number;
        ExtendedPANID: string;
        Channel: number;
        NetworkName: string;
        NetworkMasterKey: string;
    };
};
declare type AreaSceneDefinition = Href & {
    Name: string;
    Parent: Href;
    Preset: Href;
    SortOrder: number;
};
declare type PresetDefinition = Href & {
    Parent: Href;
};
export {};
//# sourceMappingURL=MessageBodyTypes.d.ts.map