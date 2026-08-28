<?php

namespace App\Http\Requests\Investor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvestorOnboardingRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'investor_type' => ['required', Rule::in(['individual', 'corporate'])],
            'full_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:investors,email'],
            'phone' => ['required', 'string', 'max:40'],
            'address' => ['required', 'string', 'max:2000'],
            'company_name' => ['nullable', 'string', 'min:2', 'max:255', 'required_if:investor_type,corporate'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'terms_agreed' => ['accepted'],
            'aml_confirmed' => ['accepted'],
        ];
    }
}
