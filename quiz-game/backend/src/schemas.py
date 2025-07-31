from marshmallow import Schema, fields

class QuestionSchema(Schema):
    id = fields.Int()
    question_text = fields.Str()
    options = fields.Method("get_options")

    def get_options(self, obj):
        return {
            "a": obj.option_a,
            "b": obj.option_b,
            "c": obj.option_c,
            "d": obj.option_d,
        }

class UserSchema(Schema):
    id = fields.Int()
    username = fields.Str()

