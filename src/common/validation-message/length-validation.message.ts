import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments)=>{
  /**
   * ValidationArguments 의 속성
   * 1) value ->검증 되고 있는 값( 입력값)
   * 2) constraints -> 파라미터에 입력된 제한값
   * 3) targetName -> 검증되는 클래스의 명
   * 4) object -> 검증하고있는 객체
   * 5) property -> 검증되고있는 객체의 프로퍼티 명
   */
  if(args.constraints.length === 2){
    return `${args.property} 는 ${args.constraints[0]} ~ ${args.constraints[1]} 글자를 입력해야합니다.`;
  }else{
    return `${args.property} 는 ${args.constraints[0]} 글자 이상 입력해야합니다.`;
  }
}