/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

import {
  MediaConvertClient,
  CreateJobCommand,
} from "@aws-sdk/client-mediaconvert";
import dotenv from "dotenv";

dotenv.config();
const { REGION } = process.env;
const emcClient = new MediaConvertClient({ region: REGION, maxAttempts: 5 });

export const lambdaHandler = async (event, context) => {
  const params = {
    Role: "arn:aws:iam::381492134130:role/service-role/MediaConvert_Default_Role",
    Settings: {
      OutputGroups: [
        {
          Name: "mp4 output",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "s3://lesson-factory/",
            },
          },
          Outputs: [
            {
              VideoDescription: {
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                // Sharpness: 50,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    InterlaceMode: "PROGRESSIVE",
                    NumberReferenceFrames: 3,
                    Syntax: "DEFAULT",
                    Softness: 0,
                    GopClosedCadence: 1,
                    GopSize: 90,
                    Slices: 1,
                    GopBReference: "DISABLED",
                    SpatialAdaptiveQuantization: "ENABLED",
                    TemporalAdaptiveQuantization: "ENABLED",
                    FlickerAdaptiveQuantization: "DISABLED",
                    EntropyEncoding: "CABAC",
                    Bitrate: 5000000,
                    FramerateControl: "INITIALIZE_FROM_SOURCE",
                    RateControlMode: "CBR",
                    CodecProfile: "MAIN",
                    MinIInterval: 0,
                    AdaptiveQuantization: "HIGH",
                    CodecLevel: "AUTO",
                    SceneChangeDetect: "ENABLED",
                    QualityTuningLevel: "SINGLE_PASS",
                    FramerateConversionAlgorithm: "DUPLICATE_DROP",
                    UnregisteredSeiTimecode: "DISABLED",
                    GopSizeUnits: "FRAMES",
                    ParControl: "INITIALIZE_FROM_SOURCE",
                    NumberBFramesBetweenReferenceFrames: 2,
                    RepeatPps: "DISABLED",
                  },
                },
                AfdSignaling: "NONE",
                RespondToAfd: "NONE",
                ColorMetadata: "INSERT",
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      AudioDescriptionBroadcasterMix: "NORMAL",
                      RateControlMode: "CBR",
                      CodecProfile: "LC",
                      CodingMode: "CODING_MODE_2_0",
                      RawFormat: "NONE",
                      SampleRate: 48000,
                      Specification: "MPEG4",
                      Bitrate: 96000,
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                },
              ],
              ContainerSettings: {
                Container: "MP4",
                Mp4Settings: {
                  CslgAtom: "INCLUDE",
                  FreeSpaceBox: "EXCLUDE",
                  MoovPlacement: "PROGRESSIVE_DOWNLOAD",
                },
              },
            },
          ],
        },
        {
          Name: "WebM output",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: "s3://lesson-factory/",
            },
          },
          Outputs: [
            {
              VideoDescription: {
                ScalingBehavior: "DEFAULT",
                TimecodeInsertion: "DISABLED",
                AntiAlias: "ENABLED",
                CodecSettings: {
                  Codec: "VP9",
                  Vp9Settings: {
                    QualityTuningLevel: "MULTI_PASS",
                    RateControlMode: "VBR",
                    GopSize: 2,
                    MaxBitrate: 12000000,
                    Bitrate: 5000000,
                    HrdBufferSize: 5000000,
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioTypeControl: "FOLLOW_INPUT",
                  CodecSettings: {
                    Codec: "OPUS",
                    OpusSettings: {
                      Bitrate: 64000,
                      Channels: 2,
                      SampleRate: 48000,
                      AudioDescriptionBroadcasterMix: "NORMAL",
                    },
                  },
                  LanguageCodeControl: "FOLLOW_INPUT",
                  AudioSourceName: "Audio Selector 1",
                },
              ],
              ContainerSettings: {
                Container: "WEBM",
              },
            },
          ],
        },
      ],
      Inputs: [
        {
          AudioSelectors: {
            "Audio Selector 1": {
              Offset: 0,
              DefaultSelection: "DEFAULT",
              AudioDurationCorrection: "TRACK",
              ProgramSelection: 1,
              SelectorType: "TRACK",
              Tracks: [1],
            },
          },
          VideoSelector: {
            ColorSpace: "FOLLOW",
          },
          FilterEnable: "AUTO",
          FilterStrength: 2,
          DeblockFilter: "ENABLED",
          DenoiseFilter: "ENABLED",
          // TimecodeSource: "EMBEDDED",  /* Don't think my iPhone vidoes have embedded Timecodes */
          FileInput: `s3://lesson-factory/${event.fileName}`, //INPUT_BUCKET_AND_FILENAME, e.g., "s3://BUCKET_NAME/FILE_NAME"
        },
      ],
    },
  };
  console.log(event.fileName);
  const convert = await emcClient.send(new CreateJobCommand(params));
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      convert,
    }),
  };

  return response;
};
