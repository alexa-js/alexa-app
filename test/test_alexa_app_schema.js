/*jshint expr: true*/
"use strict";
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.includeStack = true;

import * as Alexa from "..";

describe("Alexa", function() {
  describe("app", function() {
    var testApp = new Alexa.app("testApp");

    beforeEach(function() {
      testApp = new Alexa.app("testApp");
    });

    describe("#schema", function() {
      beforeEach(function() {
        testApp.intent("AMAZON.PauseIntent");

        testApp.intent("testIntentTwo", {
          "slots": {
            "MyCustomSlotType": "CUSTOMTYPE",
            "Tubular": "AMAZON.LITERAL",
            "Radical": "AMAZON.US_STATE"
          }
        });

        testApp.intent("testIntent", {
          "slots": {
            "AirportCode": "FAACODES",
            "Awesome": "AMAZON.DATE",
            "Tubular": "AMAZON.LITERAL"
          },
        });
      });

      it("calls the intent schema as the default", function() {
        var subject = JSON.parse(testApp.schema());
        expect(subject).to.eql({
          "intents": [{
            "intent": "AMAZON.PauseIntent",
          }, {
            "intent": "testIntentTwo",
            "slots": [{
              "name": "MyCustomSlotType",
              "samples": [],
              "type": "CUSTOMTYPE"
            }, {
              "name": "Tubular",
              "samples": [],
              "type": "AMAZON.LITERAL"
            }, {
              "name": "Radical",
              "samples": [],
              "type": "AMAZON.US_STATE"
            }]
          }, {
            "intent": "testIntent",
            "slots": [{
              "name": "AirportCode",
              "samples": [],
              "type": "FAACODES"
            }, {
              "name": "Awesome",
              "samples": [],
              "type": "AMAZON.DATE"
            }, {
              "name": "Tubular",
              "samples": [],
              "type": "AMAZON.LITERAL"
            }]
          }]
        });
      });
    });

    describe("#schemas.intent", function() {
      describe("with a minimum intent", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.intent());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent"
            }]
          });
        });
      });

      describe("with empty slots", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent", {
            "slots": {}
          });
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.intent());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent"
            }]
          });
        });
      });

      describe("with a slot", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE",
            },
          });
        });

        it("includes slots", function() {
          var subject = JSON.parse(testApp.schemas.intent());
          expect(subject).to.eql({
            "intents": [{
              "intent": "testIntent",
              "slots": [{
                "name": "MyCustomSlotType",
                "samples": [],
                "type": "CUSTOMTYPE"
              }, {
                "name": "Tubular",
                "samples": [],
                "type": "AMAZON.LITERAL"
              }, {
                "name": "Radical",
                "samples": [],
                "type": "AMAZON.US_STATE"
              }]
            }]
          });
        });
      });

      describe("with multiple intents", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");

          testApp.intent("testIntentTwo", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE"
            }
          });

          testApp.intent("testIntent", {
            "slots": {
              "AirportCode": "FAACODES",
              "Awesome": "AMAZON.DATE",
              "Tubular": "AMAZON.LITERAL"
            },
          });
        });

        it("generates the expected schema", function() {
          var subject = JSON.parse(testApp.schemas.intent());
          expect(subject).to.eql({
            "intents": [{
              "intent": "AMAZON.PauseIntent",
            }, {
              "intent": "testIntentTwo",
              "slots": [{
                "name": "MyCustomSlotType",
                "samples": [],
                "type": "CUSTOMTYPE"
              }, {
                "name": "Tubular",
                "samples": [],
                "type": "AMAZON.LITERAL"
              }, {
                "name": "Radical",
                "samples": [],
                "type": "AMAZON.US_STATE"
              }]
            }, {
              "intent": "testIntent",
              "slots": [{
                "name": "AirportCode",
                "samples": [],
                "type": "FAACODES"
              }, {
                "name": "Awesome",
                "samples": [],
                "type": "AMAZON.DATE"
              }, {
                "name": "Tubular",
                "samples": [],
                "type": "AMAZON.LITERAL"
              }]
            }]
          });
        });
      });

    });

    describe("#schemas.skillBuilder", function() {
      describe("with a minimum intent", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [{
              "name": "AMAZON.PauseIntent",
              "samples": []
            }],
            "types": []
          });
        });
      });

      describe("with empty slots", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent", {
            "slots": {}
          });
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [{
              "name": "AMAZON.PauseIntent",
              "samples": []
            }],
            "types": []
          });
        });
      });

      describe("with a slot", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "slots": {
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE"
            },
          });
        });

        it("includes slots", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [{
              "name": "testIntent",
              "samples": [],
              "slots": [{
                "name": "Tubular",
                "type": "AMAZON.LITERAL",
                "samples": []
              }, {
                "name": "Radical",
                "type": "AMAZON.US_STATE",
                "samples": []
              }]
            }],
            "types": []
          });
        });
      });

      describe("with simple utterances", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "utterances": ["turn on the thermostat", "kill all humans"]
          });
        });

        it("contains utterances", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [{
              "name": "testIntent",
              "samples": [
                "turn on the thermostat",
                "kill all humans"
              ]
            }],
            "types": []
          });
        });
      });

      describe("with multiple intents", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");

          testApp.intent("testIntentTwo", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE"
            },
          });

          testApp.intent("testIntent", {
            "slots": {
              "AirportCode": "FAACODES",
              "Awesome": "AMAZON.DATE",
              "Tubular": "AMAZON.LITERAL"
            },
          });
        });

        it("generates the expected schema", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [{
              "name": "AMAZON.PauseIntent",
              "samples": []
            }, {
              "name": "testIntentTwo",
              "samples": [],
              "slots": [{
                "name": "MyCustomSlotType",
                "type": "CUSTOMTYPE",
                "samples": []
              }, {
                "name": "Tubular",
                "type": "AMAZON.LITERAL",
                "samples": []
              }, {
                "name": "Radical",
                "type": "AMAZON.US_STATE",
                "samples": []
              }]
            }, {
              "name": "testIntent",
              "samples": [],
              "slots": [{
                "name": "AirportCode",
                "type": "FAACODES",
                "samples": []
              }, {
                "name": "Awesome",
                "type": "AMAZON.DATE",
                "samples": []
              }, {
                "name": "Tubular",
                "type": "AMAZON.LITERAL",
                "samples": []
              }]
            }],
            "types": []
          });
        });
      });

      describe("with a custom slot", function() {
        beforeEach(function() {
          testApp.customSlot("animal", [
            "cat", {
              value: "dog",
              id: "canine",
              synonyms: ["doggo", "pupper", "woofmeister"]
            }
          ]);
        });

        it("includes custom slots", function() {
          var subject = JSON.parse(testApp.schemas.skillBuilder());
          expect(subject).to.eql({
            "intents": [],
            "types": [{
              "name": "animal",
              "values": [{
                "id": null,
                "name": {
                  "value": "cat",
                  "synonyms": []
                }
              }, {
                "id": "canine",
                "name": {
                  "value": "dog",
                  "synonyms": ["doggo", "pupper", "woofmeister"]
                }
              }]
            }]
          });
        });
        describe("with multiple custom slots", function() {
          beforeEach(function() {
            testApp.customSlot("animal", [
              "cat", {
                value: "dog",
                id: "canine",
                synonyms: ["doggo", "pupper", "woofmeister"]
              }
            ]);

            testApp.customSlot("vegetable", ["carrot", "cucumber"]);
          });

          it("includes all custom slots", function() {
            var subject = JSON.parse(testApp.schemas.skillBuilder());
            expect(subject).to.eql({
              "intents": [],
              "types": [{
                "name": "animal",
                "values": [{
                  "id": null,
                  "name": {
                    "value": "cat",
                    "synonyms": []
                  }
                }, {
                  "id": "canine",
                  "name": {
                    "value": "dog",
                    "synonyms": ["doggo", "pupper", "woofmeister"]
                  }
                }]
              }, {
                "name": "vegetable",
                "values": [{
                  "id": null,
                  "name": {
                    "value": "carrot",
                    "synonyms": []
                  }
                }, {
                  "id": null,
                  "name": {
                    "value": "cucumber",
                    "synonyms": []
                  }
                }]
              }]
            });
          });
        });
      });
    });

    describe("#schemas.askcli", function() {
      describe("the invocation name", function() {
        context("when no invocation name is set", function() {
          it("should use the app name", function() {
            var subject = JSON.parse(testApp.schemas.askcli());
            expect(subject).to.eql({
              "interactionModel": {
                "dialog": {
                  "intents": []
                },
                "languageModel": {
                  "invocationName": "testApp",
                  "intents": [],
                  "types": []
                },
                "prompts": []
              }
            });
          })
        })

        context("when the app's invocationName is set", function() {
          beforeEach(function() {
            testApp.invocationName = "my cool skill";
          })

          it("should use the invocationName", function() {
            var subject = JSON.parse(testApp.schemas.askcli());
            expect(subject).to.eql({
              "interactionModel": {
                "dialog": {
                  "intents": []
                },
                "languageModel": {
                  "invocationName": "my cool skill",
                  "intents": [],
                  "types": []
                },
                "prompts": []
              }
            });
          })

          context("when a custom invocation name is passed in", function() {
            it("should override the app's setting", function() {
              var subject = JSON.parse(testApp.schemas.askcli("my okay skill"));
              expect(subject).to.eql({
                "interactionModel": {
                  "dialog": {
                    "intents": []
                  },
                  "languageModel": {
                    "invocationName": "my okay skill",
                    "intents": [],
                    "types": []
                  },
                  "prompts": []
                }
              });
            })
          })
        })
      });
      describe("with a minimum intent", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                "intents": [
                  {
                    "confirmationRequired": false,
                    "name": "AMAZON.PauseIntent",
                    "prompts": {},
                    "slots": [],
                  }
                ]
              },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [{
                  "name": "AMAZON.PauseIntent",
                  "samples": []
                }],
                "types": []
              },
              "prompts": []
            }
          });
        });
      });

      describe("with empty slots", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent", {
            "slots": {}
          });
        });

        it("contains no slots", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                 "intents": [
                   {
                     "confirmationRequired": false,
                     "name": "AMAZON.PauseIntent",
                     "prompts": {},
                     "slots": []
                   }
                 ]
               },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [{
                  "name": "AMAZON.PauseIntent",
                  "samples": []
                }],
                "types": []
              },
              "prompts": []
            }
          });
        });
      });

      describe("with a slot", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "slots": {
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE"
            },
          });
        });

        it("includes slots", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                "intents": [
                   {
                    "confirmationRequired": false,
                    "name": "testIntent",
                    "prompts": {},
                    "slots": [
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Tubular",
                        "prompts": {},
                        "type": "AMAZON.LITERAL"
                      },
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Radical",
                        "prompts": {},
                        "type": "AMAZON.US_STATE"
                      }
                    ]
                  }
                ]
              },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [{
                  "name": "testIntent",
                  "samples": [],
                  "slots": [{
                    "name": "Tubular",
                    "type": "AMAZON.LITERAL",
                    "samples": []
                  }, {
                    "name": "Radical",
                    "type": "AMAZON.US_STATE",
                    "samples": []
                  }]
                }],
                "types": []
              },
              "prompts": []
            }
          });
        });
      });

      describe("with simple utterances", function() {
        beforeEach(function() {
          testApp.intent("testIntent", {
            "utterances": ["turn on the thermostat", "kill all humans"]
          });
        });

        it("contains utterances", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                "intents": [
                  {
                    "confirmationRequired": false,
                    "name": "testIntent",
                    "prompts": {},
                    "slots": []
                  }
                ]
              },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [{
                  "name": "testIntent",
                  "samples": [
                    "turn on the thermostat",
                    "kill all humans"
                  ]
                }],
                "types": []
              },
              "prompts": []
            }
          });
        });
      });

      describe("with multiple intents", function() {
        beforeEach(function() {
          testApp.intent("AMAZON.PauseIntent");

          testApp.intent("testIntentTwo", {
            "slots": {
              "MyCustomSlotType": "CUSTOMTYPE",
              "Tubular": "AMAZON.LITERAL",
              "Radical": "AMAZON.US_STATE"
            },
          });

          testApp.intent("testIntent", {
            "slots": {
              "AirportCode": "FAACODES",
              "Awesome": "AMAZON.DATE",
              "Tubular": "AMAZON.LITERAL"
            },
          });
        });

        it("generates the expected schema", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                "intents": [
                  {
                    "confirmationRequired": false,
                    "name": "AMAZON.PauseIntent",
                    "prompts": {},
                    "slots": [],
                  },
                  {
                    "confirmationRequired": false,
                    "name": "testIntentTwo",
                    "prompts": {},
                    "slots": [
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "MyCustomSlotType",
                        "prompts": {},
                        "type": "CUSTOMTYPE",
                      },
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Tubular",
                        "prompts": {},
                        "type": "AMAZON.LITERAL",
                      },
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Radical",
                        "prompts": {},
                        "type": "AMAZON.US_STATE",
                      }
                    ]
                  },
                  {
                    "confirmationRequired": false,
                    "name": "testIntent",
                    "prompts": {},
                    "slots": [
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "AirportCode",
                        "prompts": {},
                        "type": "FAACODES",
                      },
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Awesome",
                        "prompts": {},
                        "type": "AMAZON.DATE",
                      },
                      {
                        "confirmationRequired": false,
                        "elicitationRequired": false,
                        "name": "Tubular",
                        "prompts": {},
                        "type": "AMAZON.LITERAL",
                      }
                    ]
                  }
                ]
              },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [{
                  "name": "AMAZON.PauseIntent",
                  "samples": []
                }, {
                  "name": "testIntentTwo",
                  "samples": [],
                  "slots": [{
                    "name": "MyCustomSlotType",
                    "type": "CUSTOMTYPE",
                    "samples": []
                  }, {
                    "name": "Tubular",
                    "type": "AMAZON.LITERAL",
                    "samples": []
                  }, {
                    "name": "Radical",
                    "type": "AMAZON.US_STATE",
                    "samples": []
                  }]
                }, {
                  "name": "testIntent",
                  "samples": [],
                  "slots": [{
                    "name": "AirportCode",
                    "type": "FAACODES",
                    "samples": []
                  }, {
                    "name": "Awesome",
                    "type": "AMAZON.DATE",
                    "samples": []
                  }, {
                    "name": "Tubular",
                    "type": "AMAZON.LITERAL",
                    "samples": []
                  }]
                }],
                "types": []
              },
              "prompts": []
            }
          });
        });
      });

      describe("with a custom slot", function() {
        beforeEach(function() {
          testApp.customSlot("animal", [
            "cat", {
              value: "dog",
              id: "canine",
              synonyms: ["doggo", "pupper", "woofmeister"]
            }
          ]);
        });

        it("includes custom slots", function() {
          var subject = JSON.parse(testApp.schemas.askcli());
          expect(subject).to.eql({
            "interactionModel": {
              "dialog": {
                "intents": []
              },
              "languageModel": {
                "invocationName": "testApp",
                "intents": [],
                "types": [{
                  "name": "animal",
                  "values": [{
                    "id": null,
                    "name": {
                      "value": "cat",
                      "synonyms": []
                    }
                  }, {
                    "id": "canine",
                    "name": {
                      "value": "dog",
                      "synonyms": ["doggo", "pupper", "woofmeister"]
                    }
                  }]
                }]
              },
              "prompts": []
            }
          });
        });
        describe("with multiple custom slots", function() {
          beforeEach(function() {
            testApp.customSlot("animal", [
              "cat", {
                value: "dog",
                id: "canine",
                synonyms: ["doggo", "pupper", "woofmeister"]
              }
            ]);

            testApp.customSlot("vegetable", ["carrot", "cucumber"]);
          });

          it("includes all custom slots", function() {
            var subject = JSON.parse(testApp.schemas.askcli());
            expect(subject).to.eql({
              "interactionModel": {
                "dialog": {
                  "intents": []
                },
                "languageModel": {
                  "invocationName": "testApp",
                  "intents": [],
                  "types": [{
                    "name": "animal",
                    "values": [{
                      "id": null,
                      "name": {
                        "value": "cat",
                        "synonyms": []
                      }
                    }, {
                      "id": "canine",
                      "name": {
                        "value": "dog",
                        "synonyms": ["doggo", "pupper", "woofmeister"]
                      }
                    }]
                  }, {
                    "name": "vegetable",
                    "values": [{
                      "id": null,
                      "name": {
                        "value": "carrot",
                        "synonyms": []
                      }
                    }, {
                      "id": null,
                      "name": {
                        "value": "cucumber",
                        "synonyms": []
                      }
                    }]
                  }]
                },
                "prompts": []
              }
            });
          });
        });
      });
    });
  });
});
