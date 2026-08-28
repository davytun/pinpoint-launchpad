<?php

namespace App\Http\Requests\Investor;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiligenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => [
                'required',
                'string',
                'in:financial,operational,legal_governance,product_market,document_request,general_clarification',
            ],
            'subject' => ['required', 'string', 'max:255'],
            'request_details' => ['required', 'string', 'max:2000'],
            'data_room_required' => ['nullable', 'boolean'],
        ];
    }
}
