import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments)=>{
  /**
   * ValidationArguments 의 속성
   * 1) value ->검증 되고 있는 값( 입력값)
   * 2) constraints -> 파라미터에 입력된 제한값
   * 3) targetName -> 검증되는 클래스의 명
   * 4) object -> 검증하고있는 객체
   * 5) property -> 검증되고있는 객체의 프로퍼티 명
   */
  return `${args.property} 는 Email을 입력해주세요.`
}