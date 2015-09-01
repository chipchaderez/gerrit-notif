
var themeCSSGenerator = function (themeJSON, styleStructure) {
  var FH_APPFORM_PREFIX = "fh_appform_";
  var FH_APPFORM_CONTAINER_CLASS_PREFIX = "#" + FH_APPFORM_PREFIX + "container ";
  var fh_styleStructure = {
    "logo": {
      "staticCSS": [
        {"key": "background-position", "value": "center"},
        {"key": "background-repeat", "value": "no-repeat"},
        {"key": "background-size", "value": "100% 100%"},
        {"key": "display", "value": "inline-block"},
        {"key": "max-height", "value": "150px"}, //set max height for logo
        {"key": "max-width", "value": "90%"} //max width for logo
      ]
    },
    "sections": [
      {
        "id": "form",
        "label": "Form",
        "sub_sections": [
          {
            "id": "area",
            "label": "Background",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "line-height",
                "value": "1em"
              }
            ]
          }
        ]
      },
      {
        "id": "page",
        "label": "Page",
        "sub_sections": [
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": {"top": true, "right": true, "bottom": true, "left": true},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": []
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": {"top": true, "right": true, "bottom": true, "left": true},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": []
          },
          {
            "id": "progress_steps",
            "label": "Page Area",
            "class_name": "progress_steps",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [

            ],
            "classAdditions": [

            ]
          },
          {
            "id": "progress_steps_number_container",
            "label": "Page Number Container",
            "class_name": "progress_steps .number_container",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": false, "bottom": true, "left": false}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ]
          },
          {
            "id": "progress_steps_number_container_active",
            "class_name": "progress_steps li.active .number_container",
            "label": "Page Number Container (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": false, "bottom": true, "left": false}
            },
            "staticCSS": []
          }
        ]
      },
      {
        "id": "section",
        "label": "Section",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "line-height",
                "value": "1em"
              }
            ]
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [

            ]
          }
        ]
      },
      {
        "id": "field",
        "label": "Field",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": true,
              "border": false,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ]
          },
          {
            "id": "instructions",
            "label": "Instructions",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ]
          },
          {
            "id": "input",
            "label": "Input Area",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "error",
            "label": "Error Highlighting",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "height",
                "value": "100%"
              }
            ]
          },
          {
            "id": "numbering",
            "label": "Numbering",
            "style": {
              "typography": true,
              "background": true,
              "border": false,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [

            ]
          },
          {
            "id": "required",
            "label": "Required Symbol (*)",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": false, "right": false, "bottom": false, "left": false}
            },
            "staticCSS": [
              {
                "key": "content",
                "value": "\"*\""
              },
              {
                "key": "vertical-align",
                "value": "top"
              }
            ],
            "class_name": "field_required:after"
          }
        ]
      },
      {
        "id": "button",
        "label": "Buttons",
        "sub_sections": [
          {
            "id": "bar",
            "label": "Button Bar",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": {"top": true, "right": false, "bottom": true, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-spacing",
                "value": "5px 0px"
              }
            ]
          },
          {
            "id": "default",
            "label": "Default",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "default_active",
            "class_name": "button_default:active, #fh_appform_container .button_default.active",
            "label": "Default (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "action",
            "label": "Action",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "action_active",
            "class_name": "button_action:active ,#fh_appform_container .fh_appform_button_action.active",
            "label": "Action (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "cancel",
            "label": "Cancel",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "cancel_active",
            "class_name": "button_cancel:active, #fh_appform_container .button_cancel.active",
            "label": "Cancel (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": {"top": false, "right": false, "bottom": false, "left": false},
              "padding": {"top": true, "right": true, "bottom": true, "left": true}
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "0px"
              },
              {
                "key": "white-space",
                "value": "normal"
              }
            ],
            "classAdditions": [

            ]
          }
        ]
      }
    ]};


  styleStructure = styleStructure ? styleStructure : fh_styleStructure;

  var baseTheme = { "name": "Base Template",
    "sections": [
      {
        "id": "form",
        "label": "Form",
        "sub_sections": [
          {
            "id": "area",
            "label": "Background",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(144,216,244,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(0,0,0,1)"
            }
          },
          {
            "id": "title",
            "label": "Title",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "typography": {
              "fontSize": "2.5",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(23,95,123,1)"
            }
          }
        ]
      },
      {
        "id": "page",
        "label": "Page",
        "sub_sections": [
          {
            "id": "title",
            "label": "Title",
            "padding": {
              "top": "5",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "typography": {
              "fontSize": "2",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(23,95,123,1)"
            }
          },
          {
            "id": "description",
            "label": "Description",
            "padding": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "typography": {
              "fontSize": "1.5",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(23,95,123,1)"
            }
          },
          {
            "id": "progress_steps",
            "label": "Page Area",
            "padding": {
              "top": "10",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(144,216,244,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            }
          },
          {
            "id": "progress_steps_number_container",
            "label": "Page Number Container",
            "padding": {
              "top": "5",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(65,163,200,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(0,0,0,1)"
            },
            "typography": {
              "fontSize": "1.5",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(248,248,248,1)"
            }
          },
          {
            "id": "progress_steps_number_container_active",
            "label": "Page Number Container (Active)",
            "padding": {
              "top": "5",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(38,129,164,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(1,1,1,1)"
            },
            "typography": {
              "fontSize": "1.5",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(255,254,254,1)"
            }
          }
        ]
      },
      {
        "id": "section",
        "label": "Section",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(99,191,226,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(1,1,1,1)"
            }
          },
          {
            "id": "title",
            "label": "Title",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(65,163,200,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(1,1,1,1)"
            },
            "typography": {
              "fontSize": "2",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(23,95,123,1)"
            }
          },
          {
            "id": "description",
            "label": "Description",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "italic",
              "fontColour": "rgba(23,95,123,1)"
            }
          }
        ]
      },
      {
        "id": "field",
        "label": "Field",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "5",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(38,129,164,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            }
          },
          {
            "id": "title",
            "label": "Title",
            "padding": {
              "top": "5",
              "right": "0",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "5",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(23,95,123,0.5)"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(255,255,255,1)"
            }
          },
          {
            "id": "instructions",
            "label": "Instructions",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(23,95,123,0.5)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(255,255,255,1)"
            }
          },
          {
            "id": "input",
            "label": "Input Area",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(144,216,244,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(26,4,4,1)"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(23,95,123,1)"
            }
          },
          {
            "id": "error",
            "label": "Error Highlighting",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "margin": {
              "top": "0",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(255,0,0,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(246,16,16,1)"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(0,0,0,1)"
            }
          },
          {
            "id": "numbering",
            "label": "Numbering",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(255,0,0,0)"
            },
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(0,0,0,1)"
            }
          },
          {
            "id": "required",
            "label": "Required Symbol (*)",
            "typography": {
              "fontSize": "1.0",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(255,0,0,1)"
            }
          }
        ]
      },
      {
        "id": "button",
        "label": "Buttons",
        "sub_sections": [
          {
            "id": "bar",
            "label": "Button Bar",
            "padding": {
              "top": "5",
              "right": "0",
              "bottom": "5",
              "left": "0"
            },
            "margin": {
              "top": "5",
              "right": "0",
              "bottom": "0",
              "left": "0"
            },
            "background": {
              "background_color": "rgba(38,129,164,1)"
            },
            "border": {
              "thickness": "none",
              "style": "dashed",
              "colour": "rgba(2,2,2,0.5)"
            }
          },
          {
            "id": "default",
            "label": "Default",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(99,191,226,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(254,252,252,1)"
            }
          },
          {
            "id": "default_active",
            "label": "Default (Active)",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(65,163,200,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(255,255,255,1)"
            }
          },
          {
            "id": "action",
            "label": "Action",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(65,163,200,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(0,0,0,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(255,254,254,1)"
            }
          },
          {
            "id": "action_active",
            "label": "Action (Active)",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(38,129,164,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(0,0,0,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(255,255,255,1)"
            }
          },
          {
            "id": "cancel",
            "label": "Cancel",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(255,0,0,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "rgba(0,0,0,1)"
            }
          },
          {
            "id": "cancel_active",
            "label": "Cancel (Active)",
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "background": {
              "background_color": "rgba(252,3,3,1)"
            },
            "border": {
              "thickness": "none",
              "style": "solid",
              "colour": "rgba(2,2,2,1)"
            },
            "typography": {
              "fontSize": "1.3",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "rgba(255,0,0,1)"
            }
          }
        ]
      }
    ], "logo": {
      "base64String": "data:image/png;base64,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",
      "height": 38,
      "width": 271
    }, "css": '.fh_appform_form_area{background-color:rgba(144,216,244,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;}#fh_appform_container .fh_appform_form_title{font-size:2.5em;font-family:arial;color:rgba(23,95,123,1);font-weight:bold;font-style:normal;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;line-height:1em;}#fh_appform_container .fh_appform_page_title{font-size:2em;font-family:arial;color:rgba(23,95,123,1);font-weight:bold;font-style:normal;margin:0px 0px 0px 0px;padding:5px 0px 0px 0px;}#fh_appform_container .fh_appform_page_description{font-size:1.5em;font-family:arial;color:rgba(23,95,123,1);font-weight:normal;font-style:normal;margin:0px 0px 0px 0px;padding:0px 0px 0px 0px;}#fh_appform_container .fh_appform_progress_steps{background-color:rgba(144,216,244,1);border:none;margin:0px 0px 0px 0px;padding:10px 5px 5px 5px;}#fh_appform_container .fh_appform_progress_steps .number_container{font-size:1.5em;font-family:arial;color:rgba(248,248,248,1);font-weight:normal;font-style:normal;background-color:rgba(65,163,200,1);border:none;margin:0px 0px 0px 0px;padding:5px 0px 5px 0px;border-radius:0px;}#fh_appform_container .fh_appform_progress_steps li.active .number_container{font-size:1.5em;font-family:arial;color:rgba(255,254,254,1);font-weight:normal;font-style:normal;background-color:rgba(38,129,164,1);border:none;margin:0px 0px 0px 0px;padding:5px 0px 5px 0px;}#fh_appform_container .fh_appform_section_area{background-color:rgba(99,191,226,1);border:none;margin:0px 0px 5px 0px;padding:5px 5px 5px 5px;border-radius:0px;}#fh_appform_container .fh_appform_section_title{font-size:2em;font-family:arial;color:rgba(23,95,123,1);font-weight:bold;font-style:normal;background-color:rgba(65,163,200,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;line-height:1em;}#fh_appform_container .fh_appform_section_description{font-size:1.0em;font-family:arial;color:rgba(23,95,123,1);font-style:italic;font-weight:normal;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;}#fh_appform_container .fh_appform_field_area{background-color:rgba(38,129,164,1);border:none;margin:5px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;}#fh_appform_container .fh_appform_field_title{font-size:1.0em;font-family:arial;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;background-color:rgba(23,95,123,0.5);margin:5px 0px 5px 0px;padding:5px 0px 5px 5px;border-radius:0px;}#fh_appform_container .fh_appform_field_instructions{font-size:1.0em;font-family:arial;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;background-color:rgba(23,95,123,0.5);border:none;margin:0px 0px 5px 0px;padding:5px 5px 5px 5px;border-radius:0px;}#fh_appform_container .fh_appform_field_input{font-size:1.2em;font-family:arial;color:rgba(23,95,123,1);font-weight:normal;font-style:normal;background-color:rgba(144,216,244,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;}#fh_appform_container .fh_appform_field_error{font-size:1.0em;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,0,0,1);border:none;margin:0px 0px 5px 0px;padding:5px 5px 5px 5px;border-radius:0px;height:100%;}#fh_appform_container .fh_appform_field_numbering{font-size:1.0em;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,0,0,0);margin:0px 0px 0px 0px;padding:0px 5px 5px 5px;}#fh_appform_container .fh_appform_field_required:after{font-size:1.0em;font-family:arial;color:rgba(255,0,0,1);font-weight:bold;font-style:normal;margin:0px 0px 0px 0px;padding:0px 0px 0px 0px;content:"*";vertical-align:top;}#fh_appform_container .fh_appform_button_bar{background-color:rgba(38,129,164,1);border:none;margin:5px 0px 0px 0px;padding:5px 0px 5px 0px;border-spacing:5px 0px;}#fh_appform_container .fh_appform_button_default{font-size:1.3em;font-family:arial;color:rgba(254,252,252,1);font-weight:normal;font-style:normal;background-color:rgba(99,191,226,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_button_default:active, #fh_appform_container .button_default.active{font-size:1.3em;font-family:arial;color:rgba(255,255,255,1);font-weight:normal;font-style:normal;background-color:rgba(65,163,200,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_button_action{font-size:1.3em;font-family:arial;color:rgba(255,254,254,1);font-weight:normal;font-style:normal;background-color:rgba(65,163,200,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_button_action:active ,#fh_appform_container .fh_appform_button_action.active{font-size:1.3em;font-family:arial;color:rgba(255,255,255,1);font-weight:normal;font-style:normal;background-color:rgba(38,129,164,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_button_cancel{font-size:1.3em;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,0,0,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_button_cancel:active, #fh_appform_container .button_cancel.active{font-size:1.3em;font-family:arial;color:rgba(255,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(252,3,3,1);border:none;margin:0px 0px 0px 0px;padding:5px 5px 5px 5px;border-radius:0px;white-space:normal;}#fh_appform_container .fh_appform_logo{background-image:url("data:image/png;base64,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");height:38px;width:271px;background-position:center;background-repeat:no-repeat;background-size:100% 100%;display:inline-block;max-height:150px;max-width:90%;}#fh_appform_container .fh_appform_progress_steps .pagination{padding-right:0;margin-top:5px;margin-bottom:5px}#fh_appform_container .fh_appform_field_input_container.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container input[type=text].fh_appform_field_input{height:100%}#fh_appform_container .fh_appform_page.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container .fh_appform_logo_container.col-xs-12{text-align:center}#fh_appform_container .fh_appform_input_wrapper.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container .fh_appform_section_area.panel.panel-default .panel-body{padding:0;margin:0}#fh_appform_container .sigPad ul{margin:0}#fh_appform_container .btn.text-left{text-align:left}#fh_appform_container .choice_icon:before{width:15px}#fh_appform_container .choice_icon{padding-right:10px}#fh_appform_container .fh_appform_field_area button:first-child{margin-top:0}#fh_appform_container .fh_appform_field_area button,#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn{margin-top:5px}#fh_appform_container .panel-body .fh_appform_field_area:first-child{margin-top:5px}#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn.active{margin-top:5px!important}#fh_appform_container .fh_appform_field_area button.active{margin-top:5px}#fh_appform_container .fh_appform_field_area button:active{margin-top:5px}#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn:active{margin-top:5px!important}#fh_appform_container .fh_appform_field_area button:active:first-child{margin-top:0}#fh_appform_container .fh_appform_field_area button.active:first-child{margin-top:0}#fh_appform_container .fh_appform_field_input_container.repeating{padding-right:0;padding-left:0}#fh_appform_container .fh_appform_field_input_container.repeating button.special_button{margin-top:0}#fh_appform_container .fh_appform_input_wrapper .fh_appform_field_wrapper:first-child{margin-top:0}#fh_appform_container .fh_appform_section_area .fh_appform_field_area:last-child{margin-bottom:0}#fh_appform_container .fh_appform_page .fh_appform_section_area:first-child{margin-top:0}#fh_appform_container .btn-group{font-size:12px}#fh_appform_container .fh_appform_field_wrapper{padding:0}#fh_appform_container .fh_appform_field_button_bar{padding:0}'}

  var generatedCSS = "";
  var generationFailed = {"failed": false, "failedSections": []};

  function findSection(sectionId, subSectionId) {
    var themeSections = themeJSON.sections;
    var foundThemeSections = themeSections.filter(function (themeSection) {
      return themeSection.id === sectionId;
    });

    if (foundThemeSections.length > 0) {
      var foundThemeSubSections = foundThemeSections[0].sub_sections.filter(function (themeSubSection) {
        return themeSubSection.id === subSectionId;
      });

      if (foundThemeSubSections.length > 0) {
        return foundThemeSubSections[0];
      } else {
        console.log("No sub section found for sub section id: ", subSectionId);
        return null;
      }
    } else {
      console.log("No section found for section id: ", sectionId);
      return null;
    }
  }

  function generateCSS(sectionId, subSectionId, styleDefinition) {

    function parseStyleNumber(numToValidate) {
      if (numToValidate !== null && !isNaN(numToValidate)) {
        var numToValidateInt = parseInt(numToValidate);
        if (numToValidateInt > -1) {
          return numToValidate;
        } else {
          return "0";   //Margin and padding must be > 0
        }
      } else {
        return null;
      }
    }

    function generateSpacingCSS(type, spacingJSON, spacingStructure) {
      spacingJSON = spacingJSON ? spacingJSON : {};
      //top, right, bottom left
      var marginCSS = "";
      var marginValCSS = "";
      var marginUnit = "px";
      var parsedTop = spacingStructure.top ? parseStyleNumber(spacingJSON.top) : 0;
      var parsedRight = spacingStructure.right ? parseStyleNumber(spacingJSON.right) : 0;
      var parsedBottom = spacingStructure.bottom ? parseStyleNumber(spacingJSON.bottom) : 0;
      var parsedLeft = spacingStructure.left ? parseStyleNumber(spacingJSON.left) : 0;

      //Must have all 4 values assigned
      if (parsedTop !== null && parsedRight !== null && parsedBottom !== null && parsedLeft !== null) {
        marginValCSS = parsedTop + marginUnit + " " + parsedRight + marginUnit + " " + parsedBottom + marginUnit + " " + parsedLeft + marginUnit;
        marginCSS = type + ":" + marginValCSS + ";";
        return marginCSS;
      } else {
        console.log("Error generating " + type + ". Invalid values: ", JSON.stringify(spacingJSON));
        return null;
      }
    }

    function generateStyleType(styleType) {
      var styleFunctions = {
        "background": function (backgroundJSON) {
          if (backgroundJSON.background_color) {
            return "background-color:" + backgroundJSON.background_color + ";";
          } else {
            return null;
          }
        },
        "typography": function (fontJSON) {
          var fontCSS = "";

          if (fontJSON.fontSize) {
            fontCSS = fontCSS.concat("font-size:" + fontJSON.fontSize + "em;");
          } else {
            return null;
          }

          if (fontJSON.fontFamily) {
            fontCSS = fontCSS.concat("font-family:" + fontJSON.fontFamily + ";");
          } else {
            return null;
          }

          if (fontJSON.fontColour) {
            fontCSS = fontCSS.concat("color:" + fontJSON.fontColour + ";");
          } else {
            return null;
          }

          if (fontJSON.fontStyle) {
            if (fontJSON.fontStyle === "italic") {
              fontCSS = fontCSS.concat("font-style:" + fontJSON.fontStyle + ";");
              fontCSS = fontCSS.concat("font-weight:normal;");
            } else if (fontJSON.fontStyle === "bold") {
              fontCSS = fontCSS.concat("font-weight:" + fontJSON.fontStyle + ";");
              fontCSS = fontCSS.concat("font-style:normal;");
            } else if (fontJSON.fontStyle === "normal") {
              fontCSS = fontCSS.concat("font-weight:normal;");
              fontCSS = fontCSS.concat("font-style:normal;");
            } else {
              return null;
            }
          } else {
            return null;
          }

          return fontCSS;
        },
        "border": function (borerJSON) {
          var borderStr = "";

          if (borerJSON.thickness) {
            if (borerJSON.thickness === "none") {
              return borderStr.concat("border:" + borerJSON.thickness + ";");
            } else {
              borderStr = borderStr.concat("border-width:" + borerJSON.thickness + ";");
            }
          } else {
            return null;
          }

          if (borerJSON.style) {
            borderStr = borderStr.concat("border-style:" + borerJSON.style + ";");
          } else {
            return null;
          }

          if (borerJSON.colour) {
            borderStr = borderStr.concat("border-color:" + borerJSON.colour + ";");
          } else {
            return null;
          }

          return borderStr;
        },
        "margin": function (marginJSON, marginStructure) {
          return generateSpacingCSS("margin", marginJSON, marginStructure);
        },
        "padding": function (paddingJSON, paddingStructure) {
          return generateSpacingCSS("padding", paddingJSON, paddingStructure);
        }
      };
      var subSectionStyleDefinition = null;
      if (styleDefinition[styleType] === true) {
        subSectionStyleDefinition = findSection(sectionId, subSectionId);
        if (subSectionStyleDefinition === null) {
          console.log("Expected style definition for section id: ", sectionId, " and subsection id: ", subSectionId);
          return null;
        }

        if (!subSectionStyleDefinition[styleType]) {
          console.log("No style definition for expected: ", styleType, subSectionStyleDefinition);
          return null;
        }

        if (styleFunctions[styleType]) {
          return styleFunctions[styleType](subSectionStyleDefinition[styleType]);
        } else {
          console.log("Expected style function for type: ", styleType);
          return null;
        }
      } else if (styleDefinition[styleType] === false) {
        return "";//No style, return empty string
      } else if(typeof(styleDefinition[styleType]) === "object"){
        subSectionStyleDefinition = findSection(sectionId, subSectionId);
        if (subSectionStyleDefinition === null) {
          console.log("Expected style definition for section id: ", sectionId, " and subsection id: ", subSectionId);
          return null;
        }

        if (styleFunctions[styleType]) {
          return styleFunctions[styleType](subSectionStyleDefinition[styleType], styleDefinition[styleType]);
        } else {
          console.log("Expected style function for type: ", styleType);
          return null;
        }
      } else {
        return null;
      }
    }

    var typographyCSS = generateStyleType("typography");
    var backgroundCSS = generateStyleType("background");
    var borderCSS = generateStyleType("border");
    var marginCSS = generateStyleType("margin");
    var paddingCSS = generateStyleType("padding");

    if (typographyCSS === null) {
      console.log("Typography css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (backgroundCSS === null) {
      console.log("Background css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (borderCSS === null) {
      console.log("Border css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (marginCSS === null) {
      console.log("Margin css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (paddingCSS === null) {
      console.log("Padding css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    }

    return typographyCSS + backgroundCSS + borderCSS + marginCSS + paddingCSS;
  }

  function generateCSSClassName(sectionId, subSectionId, className) {

    if (sectionId === "form" && subSectionId === "area") {
      if (className) {
        return "." + FH_APPFORM_PREFIX + className;
      } else {
        return "." + FH_APPFORM_PREFIX + sectionId + "_" + subSectionId;
      }
    }

    if (className) {
      return FH_APPFORM_CONTAINER_CLASS_PREFIX + "." + FH_APPFORM_PREFIX + className;
    } else {
      return FH_APPFORM_CONTAINER_CLASS_PREFIX + "." + FH_APPFORM_PREFIX + sectionId + "_" + subSectionId;
    }
  }

  function generateStaticCSS(staticCSSArray) {
    var staticCSSStr = "";
    staticCSSArray = staticCSSArray ? staticCSSArray : [];

    for (var cssObjIndex = 0; cssObjIndex < staticCSSArray.length; cssObjIndex++) {
      var cssObject = staticCSSArray[cssObjIndex];
      if (!cssObject.key) {
        return null;
      }

      if (!cssObject.value) {
        return null;
      }
      staticCSSStr += cssObject.key + ":" + cssObject.value + ";";
    }

    return staticCSSStr;
  }

  function generateClassAdditions(className, classAdditions) {
    var classAdditionCSS = "";

    classAdditions = classAdditions ? classAdditions : [];

    if (classAdditions) {
      for (var classAddIndex = 0; classAddIndex < classAdditions.length; classAddIndex++) {
        var classAdditionObject = classAdditions[classAddIndex];
        var fullClassName = className + classAdditionObject.classNameAddition;
        var staticCSS = generateStaticCSS(classAdditionObject.cssAdditions);

        classAdditionCSS += fullClassName + "{" + staticCSS + "}";
      }
    }

    return classAdditionCSS;
  }

  function generateLogoCSS() {
    if (styleStructure.logo) { //Only intend to generate a logo if it exists in the theme structure.
      if (themeJSON.logo) {
        var logoStr = "";
        var logoStaticCSS = "";
        var logoClassName = "";
        var base64Image = themeJSON.logo.base64String;
        var imageHeight = themeJSON.logo.height;
        var imageWidth = themeJSON.logo.width;


        if (base64Image && imageHeight && imageWidth) {
          logoStr += "background-image:url(\"" + base64Image + "\");";
          logoStr += "height:" + imageHeight + "px;";
          logoStr += "width:" + imageWidth + "px;";

          logoStaticCSS = generateStaticCSS(styleStructure.logo.staticCSS);

          logoStr = logoStr + logoStaticCSS;

          logoClassName = generateCSSClassName("logo", "logo", "logo");

          var fullLogoCSS = logoClassName + "{" + logoStr + "}";

          return fullLogoCSS;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return "";
    }
  }

  function generateThemeCSS() {

    if (!styleStructure.sections || !Array.isArray(styleStructure.sections)) {
      return null;
    }

    var logoCSS = generateLogoCSS();

    if (logoCSS === null) {
      generatedCSS = null;
      generationFailed.failed = true;
      generationFailed.failedSections.push({"section": "logo", "subSection": "logo" });
      return;
    }

    styleStructure.sections.forEach(function (themeSection) {
      var sectionId = themeSection.id;

      var subSections = themeSection.sub_sections ? themeSection.sub_sections : [];
      subSections.forEach(function (subSection) {
        var subSectionId = subSection.id;
        var subSectionStyle = subSection.style;

        var cssGenerated = generateCSS(sectionId, subSectionId, subSectionStyle);
        if (cssGenerated === null) {
          console.log("Error generating css for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var staticCSS = generateStaticCSS(subSection.staticCSS);
        if (staticCSS === null) {
          console.log("Error getting statics css for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var cssClassName = generateCSSClassName(sectionId, subSectionId, subSection.class_name);
        if (cssClassName === null) {
          console.log("Error getting css class name for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var fullClassDefinition = cssClassName + "{" + cssGenerated + staticCSS + "}";

        var additionalClassCSS = generateClassAdditions(cssClassName, subSection.classAdditions);

        fullClassDefinition += additionalClassCSS;

        generatedCSS += fullClassDefinition;
      });
    });
    generatedCSS += logoCSS;

    generatedCSS += "#fh_appform_container .fh_appform_progress_steps .pagination{padding-right:0;margin-top:5px;margin-bottom:5px}#fh_appform_container .fh_appform_field_input_container.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container input[type=text].fh_appform_field_input{height:100%}#fh_appform_container .fh_appform_page.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container .fh_appform_logo_container.col-xs-12{text-align:center}#fh_appform_container .fh_appform_input_wrapper.col-xs-12{padding-left:0;padding-right:0}#fh_appform_container .fh_appform_section_area.panel.panel-default .panel-body{padding:0;margin:0}#fh_appform_container .sigPad ul{margin:0}#fh_appform_container .btn.text-left{text-align:left}#fh_appform_container .choice_icon:before{width:15px}#fh_appform_container .choice_icon{padding-right:10px}#fh_appform_container .fh_appform_field_area button:first-child{margin-top:0}#fh_appform_container .fh_appform_field_area button,#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn{margin-top:5px}#fh_appform_container .panel-body .fh_appform_field_area:first-child{margin-top:5px}#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn.active{margin-top:5px!important}#fh_appform_container .fh_appform_field_area button.active{margin-top:5px}#fh_appform_container .fh_appform_field_area button:active{margin-top:5px}#fh_appform_container .fh_appform_field_area button.fh_appform_removeInputBtn:active{margin-top:5px!important}#fh_appform_container .fh_appform_field_area button:active:first-child{margin-top:0}#fh_appform_container .fh_appform_field_area button.active:first-child{margin-top:0}#fh_appform_container .fh_appform_field_input_container.repeating{padding-right:0;padding-left:0}#fh_appform_container .fh_appform_field_input_container.repeating button.special_button{margin-top:0}#fh_appform_container .fh_appform_input_wrapper .fh_appform_field_wrapper:first-child{margin-top:0}#fh_appform_container .fh_appform_section_area .fh_appform_field_area:last-child{margin-bottom:0}#fh_appform_container .fh_appform_page .fh_appform_section_area:first-child{margin-top:0}#fh_appform_container .btn-group{font-size:12px}#fh_appform_container .fh_appform_field_wrapper{padding:0}#fh_appform_container .fh_appform_field_button_bar{padding:0}#fh_appform_container input[type=file].fh_appform_field_input {position:absolute;opacity: 0.01;z-index: 9999;}";

    return {
      "generatedCSS": generatedCSS,
      "generationResult": generationFailed
    };
  }

  var generationFunctions = {
    "findSection": findSection,
    "generateCSS": generateCSS,
    "generateCSSClassName": generateCSSClassName,
    "generateStaticCSS": generateStaticCSS,
    "generateClassAdditions": generateClassAdditions,
    "generateLogoCSS": generateLogoCSS
  };

  return {
    "generationFunctions": generationFunctions,
    "generateThemeCSS": generateThemeCSS,
    "styleStructure": styleStructure,
    "baseTheme": baseTheme
  };
};

module.exports.themeCSSGenerator = themeCSSGenerator;


