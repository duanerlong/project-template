import { Command } from './command'

export class TemperatureCommand extends Command {
  template = {
    Abnormal: {
      ShowEnable: true,
      ShowTips: '%C体温異常',
      VoiceEnable: true,
      VoiceTips: 'abnormal temperature',
    },
    AutoCorrection: {
      Enable: true,
      Frequency: 3,
      Interval: 0,
    },
    Correction: -0.2,
    DetectMode: 0,
    Enable: true,
    HighTempJudgeSensibility: 66,
    MinPixel: 300,
    Normal: {
      ShowEnable: true,
      ShowTips: '%C体温正常',
      VoiceEnable: false,
      VoiceTips: '体温異常',
    },
    ValueRange: [35.1, 37.3],
    WaitTime: 10000,
  }

  constructor({ id = 0, temperature } = {}) {
    super()
    this.template.ValueRange[1] =
      Number(temperature) || this.template.ValueRange[1]
    this.cmd = {
      id,
      method: 'configCentre.setConfig',
      params: {
        name: 'TempDetectConfig',
        content: this.template,
      },
    }
  }
}
